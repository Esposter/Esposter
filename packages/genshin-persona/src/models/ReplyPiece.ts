// Where in a reply a request sits, as the MessageDisplay hook input spells it: the turn, the assistant message and
// The piece's index within that message, dense from zero over every flush — spoken or not — with the last flush
// Marked. The synthesizer reads the pieces of one message in index order however they arrive, since the hooks that
// Carry them run concurrently. A request with no turn — a warm, the proof the `voice` verb speaks — is one piece of
// No message, and queues behind whatever waits
export interface ReplyPiece {
  index: number;
  isFinal: boolean;
  messageId: string;
  turnId: string;
}
