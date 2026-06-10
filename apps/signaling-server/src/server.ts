import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

const PORT = Number(process.env.PORT) || 3001;

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

server.listen(PORT, () => {
  console.log(`PeerDrop Signaling Server running on port ${PORT}`);
});
