export const SocketEvents = {
  CREATE_ROOM: "create-room",
  ROOM_CREATED: "room-created",

  JOIN_ROOM: "join-room",
  ROOM_JOINED: "room-joined",

  PEER_JOINED: "peer-joined",
  PEER_LEFT: "peer-left",

  SIGNAL_OFFER: "signal-offer",
  SIGNAL_ANSWER: "signal-answer",
  SIGNAL_ICE_CANDIDATE: "signal-ice-candidate",

  ERROR: "error",
} as const;
