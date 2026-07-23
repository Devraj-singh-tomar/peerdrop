"use client";

import { ChangeEvent, useState } from "react";
import { SocketService } from "../src/services/socket.service";
import { WebRTCService } from "../src/services/webrtc.service";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [socketService] = useState(new SocketService(new WebRTCService()));

  const handleCreateRoom = async () => {
    const room = await socketService.createRoom();
    setRoomCode(room.roomCode);
  };

  const handleJoinRoom = async () => {
    await socketService.joinRoom(joinCode);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold underline">PEERDROP</h1>

      <div className="flex flex-col gap-5">
        <h1>Room Code: {roomCode}</h1>

        <button onClick={() => handleCreateRoom()} className="w-fit bg-red-500">
          Create Room
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}
        >
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="border border-red-600"
          />
          <button type="submit">Join Room</button>
        </form>

        <div className="">
          <h2 className="text-2xl font-bold underline"> File Transfer</h2>
          <input
            type="file"
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;

              const file = files[0];

              if (file) {
                const buffer = await file.arrayBuffer();

                const CHUNK_SIZE = 64 * 1024;
                const totalChunk = Math.ceil(file.size / CHUNK_SIZE);

                for (let i = 0; i < totalChunk; i++) {
                  const start = i * CHUNK_SIZE;
                  const end = start + CHUNK_SIZE;

                  const chunk = file.slice(start, end);

                  console.log("Chunk Size:-", chunk.size);
                }

                console.log("File Name:-", file.name);
                console.log("File Size:-", file.size);
                console.log("File Type:-", file.type);
                console.log("Buffer:-", buffer.byteLength);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
