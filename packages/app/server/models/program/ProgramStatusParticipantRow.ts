import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

// The participants × responses join in full, which never leaves the server: publicId is the ProgramStatus
// Dataset's participant column and nothing else reads it, so each surface projects the columns it renders
export interface ProgramStatusParticipantRow extends ProgramStatusRow {
  publicId: string;
}
