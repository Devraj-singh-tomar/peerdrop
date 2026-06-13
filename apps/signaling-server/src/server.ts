import express from "express";
import { createServer } from "http";
import { createSocketServer } from "./socket/socket-server.js";
import { registerHandlers } from "./socket/register-handlers.js";
import { PORT } from "./constants/server.constants.js";

const app = express();
const server = createServer(app);

const io = createSocketServer(server);

registerHandlers(io);

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

server.listen(PORT, () => {
  console.log(`PeerDrop Signaling Server running on port ${PORT}`);
});
