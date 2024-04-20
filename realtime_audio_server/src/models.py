from pydantic import BaseModel

class AudioChunk(BaseModel):
    chunk: bytes