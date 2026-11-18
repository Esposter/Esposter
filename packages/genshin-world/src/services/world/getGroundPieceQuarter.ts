import type { GroundPieceSquare } from "#src/models/world/GroundPieceSquare";

// The quarter of a square a split names by its index: odd indices east of the centre, and those from two north of it
export const getGroundPieceQuarter = ({ centre, half }: GroundPieceSquare, index: number): GroundPieceSquare => ({
  centre: { x: centre.x + ((index % 2 === 1 ? 1 : -1) * half) / 2, z: centre.z + ((index >= 2 ? 1 : -1) * half) / 2 },
  half: half / 2,
});
