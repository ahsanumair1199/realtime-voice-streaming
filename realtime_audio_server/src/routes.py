from fastapi import (
    WebSocket,
    Request,
    APIRouter,
    Depends,
    Response
)
from .env_variables import (
    ASSEMBLYAI_API_KEY,
    OPENAI_API_KEY,
    ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID
)
import openai
import librosa
import websockets, asyncio
import numpy as np
from .models import AudioChunk
import assemblyai as aai
import audioop, io, wave
import soundfile as sf
from scipy.signal import resample
# END IMPORTS


audio_router = APIRouter()  # ROUTER INITIATION

# SDKs Initialization
openai.api_key = OPENAI_API_KEY
aai.settings.api_key = ASSEMBLYAI_API_KEY


def on_open(session_opened: aai.RealtimeSessionOpened):
  "This function is called when the connection has been established."

  print("Session:", session_opened)

def on_data(transcript: aai.RealtimeTranscript):
  print("Transcription Recieved..")
  print(transcript)

  if not transcript.text:
    return


  if isinstance(transcript, aai.RealtimeFinalTranscript):
    print(transcript.text, end="\r\n")
  else:
    print(transcript.text, end="\r")

def on_error(error: aai.RealtimeError):
  "This function is called when the connection has been closed."

  print("An error occured:", error)

def on_close():
  "This function is called when the connection has been closed."

  print("Closing Session")

transcriber = aai.RealtimeTranscriber(
    on_data=on_data,
    on_error=on_error,
    sample_rate=16_000,
    on_open=on_open, 
    on_close=on_close,
    )

transcriber.connect()


# ROUTES
@audio_router.websocket('/user-audio-input')
async def user_audio_input(websocket: WebSocket):
    
    await websocket.accept()
    buffer_size = 3200
    audio_data_buffer = b''

    while True:
        data = await websocket.receive()
        audio_bytes = data['bytes']
        audio_data_buffer += audio_bytes
        if len(audio_data_buffer) >= buffer_size:
            # Send the buffer to the transcriber
            transcriber.stream(audio_data_buffer)
            print('Sent bytes to transcriber...')
            audio_data_buffer = b''
        # transcriber.stream(audio_bytes)
        # print('Sent bytes to transcriber...')
    