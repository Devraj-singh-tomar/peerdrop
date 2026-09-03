export interface SignalOfferRequest {
  targetSocketId: string;
  offer: RTCSessionDescriptionInit;
}
export interface SignalOfferEvent {
  senderSocketId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SignalAnswerRequest {
  targetSocketId: string;
  answer: RTCSessionDescriptionInit;
}
export interface SignalAnswerEvent {
  senderSocketId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SignalIceCandidateRequest {
  targetSocketId: string;
  candidate: RTCIceCandidateInit;
}
export interface SignalIceCandidateEvent {
  senderSocketId: string;
  candidate: RTCIceCandidateInit;
}

export interface SocketErrorPayload {
  message: string;
}
