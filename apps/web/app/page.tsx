"use client";

import { useState } from "react";
import { SocketService } from "../src/services/socket.service";
import { WebRTCService } from "../src/services/webrtc.service";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
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

        <div>
          <h2>logs:</h2>

          <ul>
            {logs.map((log) => (
              <li>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
