import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

// A run's cast and its rewinds: the Principal Cast as it stands, the Principal Cast as it stood at the end of its last
// Boss stage, which a rewind returns it to, and the rewinds the run holds
export interface ImaginariumRun {
  checkpoint: ImaginariumMember[];
  principalCast: ImaginariumMember[];
  rewinds: number;
}
