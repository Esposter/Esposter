import type { StatueSection } from "#src/models/kits/statue/StatueSection";
import type { StatueSurface } from "#src/models/kits/statue/StatueSurface";

interface Ring {
  height: number;
  radii: readonly number[];
}

const FULL_TURN = Math.PI * 2;

const writeRingVertex = (
  positions: Float32Array,
  vertex: number,
  { height, radii }: Ring,
  sector: number,
  angleCount: number,
): void => {
  const radius = radii[sector] ?? 0;
  const turn = (sector / angleCount) * FULL_TURN;
  positions[vertex * 3] = radius * Math.cos(turn);
  positions[vertex * 3 + 1] = height;
  positions[vertex * 3 + 2] = radius * Math.sin(turn);
};

const writeTriangle = (indices: Uint32Array, offset: number, first: number, second: number, third: number): number => {
  indices[offset] = first;
  indices[offset + 1] = second;
  indices[offset + 2] = third;
  return offset + 3;
};

// A stack of sections as one closed surface, the pure step a statue's kit builds its geometry from: one ring of each
// Section's radii at its middle height, and the surface lofts from ring to ring, the first section's radii at the foot
// And the last's at the head, so the radius moves between two sections as one wall rather than as a ledge. Both caps
// Close it on their own copies of their rings, so each stays flat where its wall rounds into it
export const computeStatueSurface = (sections: readonly StatueSection[]): StatueSurface => {
  const rings: Ring[] = [];
  let height = 0;
  for (const { height: sectionHeight, radii } of sections) {
    rings.push({ height: height + sectionHeight / 2, radii });
    height += sectionHeight;
  }
  const bottomSection = sections[0];
  const topSection = sections.at(-1);
  if (bottomSection && topSection) {
    rings.unshift({ height: 0, radii: bottomSection.radii });
    rings.push({ height, radii: topSection.radii });
  }
  const angleCount = sections[0]?.radii.length ?? 0;
  const ringCount = rings.length;
  const bottomCapCentre = ringCount * angleCount;
  const topCapCentre = bottomCapCentre + angleCount + 1;
  const positions = new Float32Array((topCapCentre + angleCount + 1) * 3);
  for (const [ringIndex, ring] of rings.entries())
    for (let sector = 0; sector < angleCount; sector++)
      writeRingVertex(positions, ringIndex * angleCount + sector, ring, sector, angleCount);
  const bottomRing = rings[0];
  const topRing = rings.at(-1);
  if (bottomRing && topRing) {
    positions[bottomCapCentre * 3 + 1] = bottomRing.height;
    positions[topCapCentre * 3 + 1] = topRing.height;
    for (let sector = 0; sector < angleCount; sector++) {
      writeRingVertex(positions, bottomCapCentre + 1 + sector, bottomRing, sector, angleCount);
      writeRingVertex(positions, topCapCentre + 1 + sector, topRing, sector, angleCount);
    }
  }
  const indices = new Uint32Array((Math.max(0, ringCount - 1) * 6 + 6) * angleCount);
  let offset = 0;
  for (let ringIndex = 0; ringIndex < ringCount - 1; ringIndex++)
    for (let sector = 0; sector < angleCount; sector++) {
      const nextSector = (sector + 1) % angleCount;
      const lower = ringIndex * angleCount + sector;
      const lowerNext = ringIndex * angleCount + nextSector;
      const upper = (ringIndex + 1) * angleCount + sector;
      const upperNext = (ringIndex + 1) * angleCount + nextSector;
      offset = writeTriangle(indices, offset, lower, upper, lowerNext);
      offset = writeTriangle(indices, offset, lowerNext, upper, upperNext);
    }
  for (let sector = 0; sector < angleCount; sector++) {
    const nextSector = (sector + 1) % angleCount;
    offset = writeTriangle(
      indices,
      offset,
      bottomCapCentre,
      bottomCapCentre + 1 + sector,
      bottomCapCentre + 1 + nextSector,
    );
  }
  for (let sector = 0; sector < angleCount; sector++) {
    const nextSector = (sector + 1) % angleCount;
    offset = writeTriangle(indices, offset, topCapCentre, topCapCentre + 1 + nextSector, topCapCentre + 1 + sector);
  }
  return { indices, positions };
};
