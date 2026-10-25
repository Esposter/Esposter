// A line Ask Claude sends: to the session the reader picked, or to a new session started in a folder when none is
// Picked, which takes the line as its first prompt once it has opened. The absent form is the empty string
export interface AssistantLine {
  cwd: string;
  sessionId: string;
  text: string;
}
