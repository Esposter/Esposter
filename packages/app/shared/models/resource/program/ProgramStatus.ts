import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

// `isResponded` is read from a capped response scan, so a program whose survey holds more responses than that cap
// Reads some responders as awaiting. The blade counts responders out loud, so it is handed the flag rather than
// Left to present an undercount as the answer
export interface ProgramStatus {
  isRespondedPartial: boolean;
  rows: ProgramStatusRow[];
}
