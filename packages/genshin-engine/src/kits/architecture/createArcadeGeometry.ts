import type { ArcadeOptions } from "#src/kits/architecture/ArcadeOptions";

import { BoxGeometry, BufferGeometry, ExtrudeGeometry, Path, Shape } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// The segments a round arch's head is drawn with
const ARCH_SEGMENTS = 16;
// An arcade as one geometry: its wall drawn as an elevation with a round headed opening per bay and extruded through
// Its depth, so each opening's soffit is a hard edged face, then its railing along the deck. It runs along +x from
// The origin, standing on it, centred on z
export const createArcadeGeometry = ({
  balustrade,
  bayCount,
  bayWidth,
  depth,
  height,
  pierWidth,
  spandrelHeight,
}: ArcadeOptions): BufferGeometry => {
  const length = bayCount * bayWidth + pierWidth;
  const archRadius = (bayWidth - pierWidth) / 2;
  const springing = height - spandrelHeight - archRadius;
  const elevation = new Shape().moveTo(0, 0).lineTo(length, 0).lineTo(length, height).lineTo(0, height).closePath();
  for (let bay = 0; bay < bayCount; bay++) {
    const left = pierWidth + bay * bayWidth;
    const centre = left + archRadius;
    const opening = new Path().moveTo(left, 0).lineTo(left, springing);
    opening.absarc(centre, springing, archRadius, Math.PI, 0, true);
    opening.lineTo(left + archRadius * 2, 0).closePath();
    elevation.holes.push(opening);
  }
  const parts: BufferGeometry[] = [
    new ExtrudeGeometry(elevation, { bevelEnabled: false, curveSegments: ARCH_SEGMENTS, depth }).translate(
      0,
      0,
      -depth / 2,
    ),
  ];
  if (balustrade) {
    const { height: railHeight, postSpacing, thickness } = balustrade;
    parts.push(
      new BoxGeometry(length, thickness, thickness).translate(length / 2, height + railHeight - thickness / 2, 0),
    );
    const postCount = Math.floor(length / postSpacing) + 1;
    for (let post = 0; post < postCount; post++)
      parts.push(
        new BoxGeometry(thickness, railHeight, thickness).translate(
          Math.min(post * postSpacing + thickness / 2, length - thickness / 2),
          height + railHeight / 2,
          0,
        ),
      );
  }
  const nonIndexedParts = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const arcadeGeometry = mergeGeometries(nonIndexedParts) ?? new BufferGeometry();
  for (const part of new Set([...parts, ...nonIndexedParts])) part.dispose();
  return arcadeGeometry;
};
