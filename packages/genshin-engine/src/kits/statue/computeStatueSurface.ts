import type { StatueSection } from "#src/models/kits/statue/StatueSection";
import type { StatueSurface } from "#src/models/kits/statue/StatueSurface";

interface Ring {
  centre: readonly number[];
  height: number;
  radii: readonly number[];
}

const FULL_TURN = Math.PI * 2;

const writeRingVertex = (
  positions: Float32Array,
  vertex: number,
  { centre: [x = 0, z = 0], height, radii }: Ring,
  sector: number,
  angleCount: number,
): void => {
  const radius = radii[sector] ?? 0;
  const turn = (sector / angleCount) * FULL_TURN;
  positions[vertex * 3] = x + radius * Math.cos(turn);
  positions[vertex * 3 + 1] = height;
  positions[vertex * 3 + 2] = z + radius * Math.sin(turn);
};

// A cap's centre: its ring's centre at its height
const writeRingCentre = (positions: Float32Array, vertex: number, { centre: [x = 0, z = 0], height }: Ring): void => {
  positions[vertex * 3] = x;
  positions[vertex * 3 + 1] = height;
  positions[vertex * 3 + 2] = z;
};

const writeTriangle = (indices: Uint32Array, offset: number, first: number, second: number, third: number): number => {
  indices[offset] = first;
  indices[offset + 1] = second;
  indices[offset + 2] = third;
  return offset + 3;
};

// A stack of sections as one closed surface, the pure step a statue's kit builds its geometry from: one ring of each
// Section's radii about its centre at its middle height, and the surface lofts from ring to ring, the first section's
// Ring at the foot and the last's at the head, so the radius and the centre move between two sections as one wall
// Rather than as a ledge, and a stack can bend as a leaf does. Both caps close it on their own copies of their rings,
// Each about its ring's centre, so each stays flat where its wall rounds into it
export const computeStatueSurface = (sections: readonly StatueSection[]): StatueSurface => {
  const rings: Ring[] = [];
  let height = 0;
  for (const { centre, height: sectionHeight, radii } of sections) {
    rings.push({ centre, height: height + sectionHeight / 2, radii });
    height += sectionHeight;
  }
  const bottomSection = sections[0];
  const topSection = sections.at(-1);
  if (bottomSection && topSection) {
    rings.unshift({ ...bottomSection, height: 0 });
    rings.push({ ...topSection, height });
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
    writeRingCentre(positions, bottomCapCentre, bottomRing);
    writeRingCentre(positions, topCapCentre, topRing);
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
