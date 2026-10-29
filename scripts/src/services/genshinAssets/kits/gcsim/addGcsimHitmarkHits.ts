import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHitSource";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { AttackArea } from "genshin-world";
import type { Except } from "type-fest";

import { KIT_LENGTH_KEY } from "#src/services/genshinAssets/kits/constants";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";

// The hits a list of hitmarks gives: its count at `${path}.hits.length`, then one hit at `${path}.hits.${index}` for
// Each hitmark that is a number. A hit is cited at the list's file, at its element's line where the list has one else
// At the list's line, and lands after the travel of the projectile the list is released at. `readHit` gives its area,
// Attack and talent leaf
export const addGcsimHitmarkHits = (
  writer: GcsimKitCandidateWriter,
  { travelMap }: GcsimCharacter,
  {
    hitmarks,
    path,
    readHit,
    targetingArea,
  }: {
    hitmarks: {
      elementLines?: Partial<Record<number, number>>;
      file: string;
      line: number;
      name: string;
      values: readonly (number | undefined)[];
    };
    path: string;
    readHit: (hitIndex: number, hitmark: number) => Except<GcsimHitSource, "hitmark">;
    targetingArea: AttackArea;
  },
): void => {
  const { add, addHit, toFile } = writer;
  add(`${path}.hits.${KIT_LENGTH_KEY}`, hitmarks.values.length, toFile(hitmarks.file), hitmarks.line);
  for (const [hitIndex, hitmark] of hitmarks.values.entries()) {
    if (hitmark === undefined) continue;
    addHit(
      `${path}.hits.${hitIndex}`,
      {
        ...readHit(hitIndex, hitmark),
        hitmark: {
          file: hitmarks.file,
          line: hitmarks.elementLines?.[hitIndex] ?? hitmarks.line,
          value: getGcsimLandingFrames(travelMap, hitmarks.name, hitmark),
        },
      },
      targetingArea,
    );
  }
};
