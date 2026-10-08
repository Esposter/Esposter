import type { BuildingOptions } from "#src/models/kits/architecture/BuildingOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { RoofKind } from "#src/models/kits/architecture/RoofKind";
import { CylinderGeometry } from "three";

const CONICAL_ROOF_SEGMENTS = 16;
// A building's platform, walls and roof as one geometry for one material, standing on the origin and centred on it.
// A conical roof is a cone scaled to the footprint, so it stands over the walls' outside edge on any footprint
export const createBuildingGeometry = ({
  depth,
  platformHeight,
  roofHeight,
  roofKind,
  wallHeight,
  wallThickness,
  width,
}: BuildingOptions): BufferGeometry => {
  const halfDepth = depth / 2;
  const halfWidth = width / 2;
  const wallTop = platformHeight + wallHeight;
  const innerDepth = halfDepth - wallThickness;
  const innerWidth = halfWidth - wallThickness;
  const boxes = [
    [-halfWidth, 0, -halfDepth, halfWidth, platformHeight, halfDepth],
    [-halfWidth, platformHeight, -halfDepth, halfWidth, wallTop, -innerDepth],
    [-halfWidth, platformHeight, innerDepth, halfWidth, wallTop, halfDepth],
    [-halfWidth, platformHeight, -innerDepth, -innerWidth, wallTop, innerDepth],
    [innerWidth, platformHeight, -innerDepth, halfWidth, wallTop, innerDepth],
  ];
  if (roofKind === RoofKind.Flat)
    boxes.push([-halfWidth, wallTop, -halfDepth, halfWidth, wallTop + roofHeight, halfDepth]);
  const buildingGeometry = createBoxesGeometry(boxes);
  if (roofKind === RoofKind.Flat) return buildingGeometry;

  const roofGeometry = new CylinderGeometry(0, 1, roofHeight, CONICAL_ROOF_SEGMENTS)
    .scale(halfWidth, 1, halfDepth)
    .translate(0, wallTop + roofHeight / 2, 0);
  return mergeGeometryParts([buildingGeometry, roofGeometry]);
};
