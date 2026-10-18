import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

// Whether the catalogue outlines an area, since no ground is fitted inside an outline that is not there
export const checkHasOutline = ({ outline }: GroundPieceArea): boolean => outline.length > 0;
