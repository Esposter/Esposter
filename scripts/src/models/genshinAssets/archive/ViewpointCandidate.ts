import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

// A viewpoint before its name is checked: the candidate's fields, and the group and config id that place it in its
// Scene group
export interface ViewpointCandidate extends ArchiveCandidate {
  configId: number;
  groupId: number;
}
