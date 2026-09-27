import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";
import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";

// The audience is read like any dataset, capped, so a person past the cap is issued nothing. The owner is about to
// Send these links, and a missing one is a person who never hears from them — so the run says what it could not see
export interface GeneratedProgramParticipants {
  audienceTruncation?: DatasetTruncation;
  participants: ProgramParticipant[];
}
