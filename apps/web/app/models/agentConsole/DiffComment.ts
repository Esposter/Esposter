import type { DiffSide } from "@/models/agentConsole/DiffSide";

// A comment a person left on one line of a file's diff, held until it is sent to the session
export interface DiffComment {
  filePath: string;
  // The line's number in its side's text, the file as it stood before the change or as it stands after it
  lineNumber: number;
  // The line as the diff drew it, quoted in the prompt the comments are sent as
  lineText: string;
  side: DiffSide;
  text: string;
}
