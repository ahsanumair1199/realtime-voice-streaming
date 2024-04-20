import React, { useState, useRef, useEffect } from "react";
import { Container, Button, Card } from "react-bootstrap";
// END IMPORTS

const App = () => {
  const [webSocket, setWebSocket] = useState(null);
  const mediaRecorder = useRef(null);
  const constraints = {
    audio: true,
  };

  useEffect(() => {
    const initializeWebSocket = () => {
      const ws = new WebSocket("ws://127.0.0.1:8000/user-audio-input");
      setWebSocket(ws);
    };

    initializeWebSocket();

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Audio Track Settings:");
      console.log("---------------------");
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        console.log("Sample Rate:", track.getSettings().sampleRate);
        console.log("Channel Count:", track.getSettings().channelCount);
      }
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current;
      mediaRecorder.current.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          webSocket &&
          webSocket.readyState === WebSocket.OPEN
        ) {
          webSocket.send(event.data);
        }
      };

      mediaRecorder.current.start(450);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
  };

  return (
    <Container className="pt-5 d-flex justify-content-center align-items-center flex-column">
      <h1 className="mb-3">Realtime Voice Streaming</h1>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <Button className="mx-3" onClick={startRecording}>
          Start Speaking
        </Button>
        <Button onClick={stopRecording}>Stop Speaking</Button>
      </div>
      <Card style={{ width: "100%" }}>
        <Card.Body>
          <Card.Title className="text-center">
            Realtime Transcription:
          </Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default App;
