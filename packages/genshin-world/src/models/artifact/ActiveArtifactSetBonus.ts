import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";

// A set bonus a character's artifacts reach: the set's bonus at the piece count it is active from, named by its set's id
export interface ActiveArtifactSetBonus extends ArtifactSetBonus {
  setId: number;
}
