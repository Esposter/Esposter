import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { AttackArea } from "genshin-world";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimQueuedHits } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { readGcsimHoldHitmarks } from "#src/services/genshinAssets/kits/gcsim/readGcsimHoldHitmarks";

// The hits of an ability with no hitmark constant, fired by its queue calls: each call of the file its frames are in
// Firing its first literal, at its damage delay, joined to its multiplier by its place and to its own hitbox, else to the
// Ability's hitbox of its place where the ability's hitboxes are as many as its hits. A call firing another literal is a DoT's or a passive's, not one of its hits
export const addGcsimQueuedHits = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  gcsim: GcsimCharacter,
  {
    abilityName,
    attackTags,
    framesName,
    path,
    targetingArea,
  }: {
    abilityName: string;
    attackTags: readonly string[];
    framesName: string;
    path: string;
    targetingArea: AttackArea;
  },
): void => {
  const { attacks, config, constantMap } = gcsim;
  // The file is the one the frames are in, else the one the first literal of the attack tags is
  const file =
    findGcsimConstant(constantMap, framesName)?.file ??
    attacks.find(({ attackTag }) => attackTag !== undefined && attackTags.includes(attackTag))?.file;
  // A call firing at a hold's hitmark is the hold's hit, which the hold reads, so it is none of this ability's
  const heldHitmarks = readGcsimHoldHitmarks(gcsim);
  const fileHits = (file === undefined ? [] : getGcsimQueuedHits(gcsim, attackTags, file)).filter(
    ({ delay, file: hitFile }) => !heldHitmarks.some((held) => held.file === hitFile && held.delay === delay),
  );
  const [firstHit] = fileHits;
  if (firstHit === undefined) return;
  const queuedHits = fileHits.filter(({ attack }) => attack === firstHit.attack);
  const hitboxes = config.abilityHitboxesMap.get(abilityName) ?? [];
  const isHitboxJoined = hitboxes.length === queuedHits.length;
  add(`${path}.hits.length`, queuedHits.length, toFile(firstHit.file), firstHit.line);
  for (const [hitIndex, { attack, delay, file: hitFile, hitbox, line }] of queuedHits.entries())
    addHit(
      `${path}.hits.${hitIndex}`,
      {
        areaHitbox: hitbox ?? (isHitboxJoined ? hitboxes[hitIndex] : undefined),
        attack,
        hitmark: { file: hitFile, line, value: delay },
        talentLeaf: findGcsimTalentLeaf(config, attack.talentVariable, [hitIndex]),
      },
      targetingArea,
    );
};
