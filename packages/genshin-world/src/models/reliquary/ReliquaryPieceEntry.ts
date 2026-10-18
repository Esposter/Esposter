import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";

// A piece of an artifact set by its item id, with the id of the set it is made of, so a bag entry names its set and slot
export interface ReliquaryPieceEntry extends ReliquaryPieceData {
  setId: number;
}
