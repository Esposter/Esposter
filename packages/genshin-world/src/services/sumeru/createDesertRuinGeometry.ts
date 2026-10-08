import type { DesertRuinPiece } from "#src/models/sumeru/DesertRuinPiece";
import type { BufferGeometry } from "three";

import { DesertRuinPieceKind } from "#src/models/sumeru/DesertRuinPieceKind";
import { exhaustiveGuard } from "@esposter/shared";
import { createBoxesGeometry, createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";

const COLUMN_RADIAL_SEGMENTS = 12;
const COLUMN_SHAFT_SHARE = 0.9;
const COLUMN_TAPER = 0.85;
const COLUMN_CAPITAL_FLARE = 1.25;
// A square section's corners sit on the axes at four segments, so it is turned a quarter to put its faces on them
const SQUARE_RADIAL_SEGMENTS = 4;
const SQUARE_TURN = Math.PI / 4;
const OBELISK_SHAFT_SHARE = 0.9;
const OBELISK_TAPER = 0.5;

type ColonnadePiece = Extract<DesertRuinPiece, { kind: DesertRuinPieceKind.Colonnade }>;
type HalfBuriedHallPiece = Extract<DesertRuinPiece, { kind: DesertRuinPieceKind.HalfBuriedHall }>;
type ObeliskPiece = Extract<DesertRuinPiece, { kind: DesertRuinPieceKind.Obelisk }>;
type SteppedPyramidPiece = Extract<DesertRuinPiece, { kind: DesertRuinPieceKind.SteppedPyramid }>;

// A row of columns, each a tapering shaft under a flared capital, centred on the piece's position
const createColonnade = ({
  columnCount,
  columnHeight,
  columnRadius,
  columnSpacing,
  position,
}: ColonnadePiece): BufferGeometry => {
  const shaftHeight = columnHeight * COLUMN_SHAFT_SHARE;
  const capitalRadius = columnRadius * COLUMN_CAPITAL_FLARE;
  const columnGeometries = Array.from({ length: columnCount }, (_value, index) =>
    createLatheStackGeometry({
      isFaceted: false,
      radialSegments: COLUMN_RADIAL_SEGMENTS,
      sections: [
        { bottomRadius: columnRadius, height: shaftHeight, topRadius: columnRadius * COLUMN_TAPER },
        { bottomRadius: capitalRadius, height: columnHeight - shaftHeight, topRadius: capitalRadius },
      ],
    }).translate(position.x + (index - (columnCount - 1) / 2) * columnSpacing, 0, position.z),
  );
  return mergeGeometryParts(columnGeometries);
};

// A square shaft tapering to a point, its shaft most of its height
const createObelisk = ({ baseRadius, height, position }: ObeliskPiece): BufferGeometry => {
  const shaftHeight = height * OBELISK_SHAFT_SHARE;
  return createLatheStackGeometry({
    isFaceted: true,
    radialSegments: SQUARE_RADIAL_SEGMENTS,
    sections: [
      { bottomRadius: baseRadius, height: shaftHeight, topRadius: baseRadius * OBELISK_TAPER },
      { bottomRadius: baseRadius * OBELISK_TAPER, height: height - shaftHeight, topRadius: 0 },
    ],
  })
    .rotateY(SQUARE_TURN)
    .translate(position.x, 0, position.z);
};

// Each step a flat square drum a step narrower than the one below, so the sections are ledges rather than a slope
const createSteppedPyramid = ({ baseRadius, position, stepCount, stepHeight }: SteppedPyramidPiece): BufferGeometry => {
  const sections = Array.from({ length: stepCount }, (_value, step) => {
    const stepRadius = baseRadius * (1 - step / stepCount);
    return { bottomRadius: stepRadius, height: stepHeight, topRadius: stepRadius };
  });
  return createLatheStackGeometry({ isFaceted: true, radialSegments: SQUARE_RADIAL_SEGMENTS, sections })
    .rotateY(SQUARE_TURN)
    .translate(position.x, 0, position.z);
};

// A hall as one box from below the sand up to its roof, the sand hiding its foot
const createHalfBuriedHall = ({
  buriedHeight,
  height,
  length,
  position,
  width,
}: HalfBuriedHallPiece): BufferGeometry => {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  return createBoxesGeometry([
    [-halfWidth, -buriedHeight, -halfLength, halfWidth, height - buriedHeight, halfLength],
  ]).translate(position.x, 0, position.z);
};

const createPieceGeometry = (piece: DesertRuinPiece): BufferGeometry => {
  switch (piece.kind) {
    case DesertRuinPieceKind.Colonnade:
      return createColonnade(piece);
    case DesertRuinPieceKind.HalfBuriedHall:
      return createHalfBuriedHall(piece);
    case DesertRuinPieceKind.Obelisk:
      return createObelisk(piece);
    case DesertRuinPieceKind.SteppedPyramid:
      return createSteppedPyramid(piece);
    default:
      return exhaustiveGuard(piece);
  }
};

// A desert ruin's pieces, each standing where it is placed, merged into one geometry for one material
export const createDesertRuinGeometry = (pieces: DesertRuinPiece[]): BufferGeometry =>
  mergeGeometryParts(pieces.map((piece) => createPieceGeometry(piece)));
