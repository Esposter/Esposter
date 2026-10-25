import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

export interface Catalogue {
  regions: { areas: GroundPieceArea[]; id: string }[];
}
