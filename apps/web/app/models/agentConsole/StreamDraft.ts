// The main agent's block still being written, built from the stream's pieces until the whole block replaces it
export interface StreamDraft {
  blockId: string;
  isThinking: boolean;
  text: string;
}
