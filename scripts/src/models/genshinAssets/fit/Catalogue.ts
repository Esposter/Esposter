import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

export interface Catalogue {
  regions: { areas: GroundPieceArea[]; id: string }[];
}
