import type { LoginTower } from "#src/models/login/LoginTower";
import type { LatheSection } from "genshin-engine";

import { LoginTowerProfileMap } from "#src/services/login/tower/LoginTowerProfileMap";
import { createColonnadeGeometry, createLatheStackGeometry } from "genshin-engine";
import { BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const FACETED_SEGMENTS = 8;
const ROUND_SEGMENTS = 24;
const COLUMN_SEGMENTS = 8;
const getHeight = (sections: readonly LatheSection[]): number =>
  sections.reduce((height, section) => height + section.height, 0);
const scaleSection = ({ bottomRadius, height, topRadius }: LatheSection, diameter: number): LatheSection => ({
  bottomRadius: bottomRadius * diameter,
  height: height * diameter,
  topRadius: topRadius * diameter,
});
// A tower as one geometry, from the floor it rises out of to its top: its shaft banded by mouldings at its kind's
// Interval, counted down from its head so the band under the head is always whole, then the head, and for a crowned
// Tower its ring of columns and the cap they hold up
export const createLoginTowerGeometry = ({ diameter, kind, top }: LoginTower, floor: number): BufferGeometry => {
  const { crownSections, headSections, isFaceted, ring, ...profile } = LoginTowerProfileMap[kind];
  const colonnade = "colonnade" in profile ? profile.colonnade : undefined;
  const radialSegments = isFaceted ? FACETED_SEGMENTS : ROUND_SEGMENTS;
  const crownHeight = getHeight(crownSections) * diameter;
  const colonnadeHeight = (colonnade?.height ?? 0) * diameter;
  const headHeight = getHeight(headSections) * diameter;
  const shaftTop = top - crownHeight - colonnadeHeight - headHeight;
  const shaftSections: LatheSection[] = [];
  let remaining = shaftTop - floor;
  const shaftRadius = diameter / 2;
  const ringRadius = ring.radius * diameter;
  const ringThickness = ring.thickness * diameter;
  const bandHeight = ring.interval * diameter - ringThickness;
  while (remaining > 0) {
    const ringHeight = Math.min(ringThickness, remaining);
    shaftSections.unshift({ bottomRadius: ringRadius, height: ringHeight, topRadius: ringRadius });
    remaining -= ringHeight;
    const shaftHeight = Math.min(bandHeight, remaining);
    if (shaftHeight > 0)
      shaftSections.unshift({ bottomRadius: shaftRadius, height: shaftHeight, topRadius: shaftRadius });
    remaining -= shaftHeight;
  }
  const lower = createLatheStackGeometry({
    isFaceted,
    radialSegments,
    sections: [...shaftSections, ...headSections.map((section) => scaleSection(section, diameter))],
  }).translate(0, floor, 0);
  const parts = [lower];
  if (colonnade)
    parts.push(
      createColonnadeGeometry({
        columnCount: colonnade.columnCount,
        columnHeight: colonnadeHeight,
        columnRadius: colonnade.columnRadius * diameter,
        radialSegments: COLUMN_SEGMENTS,
        ringRadius: colonnade.ringRadius * diameter,
      }).translate(0, shaftTop + headHeight, 0),
    );
  if (crownSections.length > 0)
    parts.push(
      createLatheStackGeometry({
        isFaceted,
        radialSegments,
        sections: crownSections.map((section) => scaleSection(section, diameter)),
      }).translate(0, shaftTop + headHeight + colonnadeHeight, 0),
    );
  const nonIndexedParts = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const towerGeometry = mergeGeometries(nonIndexedParts) ?? new BufferGeometry();
  for (const part of new Set([...parts, ...nonIndexedParts])) part.dispose();
  return towerGeometry;
};
