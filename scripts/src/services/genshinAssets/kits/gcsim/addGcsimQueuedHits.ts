import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";
import type { AttackArea } from "genshin-world";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimQueuedHits } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { readGcsimHoldHitmarks } from "#src/services/genshinAssets/kits/gcsim/readGcsimHoldHitmarks";

// The declaration an attack is made from, by its literal's file, variable and line: a `Mult` set's copy shares its
// Literal's declaration, where a DoT is a literal of its own under the same variable
export const isSameDeclaration = (attack: GcsimAttack, other: GcsimAttack): boolean =>
  attack.file === other.file && attack.siteLine === other.siteLine && attack.variableName === other.variableName;

// A call firing the first hit's attack, or a copy of it where neither call repeats in a loop: a loop's repeated calls
// Are ticks of their attack, as a DoT's calls are, unless the ability's loop calls are its hits
const isSameHit = (hit: GcsimQueuedHit, first: GcsimQueuedHit, loopCallsAreHits: boolean): boolean => {
  if (loopCallsAreHits)
    return hit.isTaskCall !== true && (hit.attack === first.attack || isSameDeclaration(hit.attack, first.attack));
  return (
    hit.attack === first.attack ||
    (isSameDeclaration(hit.attack, first.attack) && hit.iterations === undefined && first.iterations === undefined)
  );
};

// The hits of an ability with no hitmark constant, fired by its queue calls: each call of the file its frames are in
// Firing its first declaration, at its damage delay, joined to its multiplier by its place and to its own hitbox,
// Else to the ability's hitbox of its place where the ability's hitboxes are as many as its hits. A call firing another
// Declaration is a DoT's or a passive's, not one of its hits, and a call firing an excluded declaration is another
// Action's, such as a Charged attack's variant's
export const addGcsimQueuedHits = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  gcsim: GcsimCharacter,
  {
    abilityName,
    attackTags,
    excludedAttacks = [],
    framesName,
    loopCallsAreHits = false,
    path,
    targetingArea,
  }: {
    abilityName: string;
    attackTags: readonly string[];
    excludedAttacks?: readonly GcsimAttack[];
    framesName: string;
    // Whether a loop's repeated calls of the first hit's declaration are hits of their own, not its ticks
    loopCallsAreHits?: boolean;
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
  const fileHits = (file === undefined ? [] : getGcsimQueuedHits(gcsim, attackTags, file))
    .filter(({ delay, file: hitFile }) => !heldHitmarks.some((held) => held.file === hitFile && held.delay === delay))
    .filter(({ attack }) => !excludedAttacks.some((excluded) => isSameDeclaration(attack, excluded)));
  const [firstHit] = fileHits;
  if (firstHit === undefined) return;
  const queuedHits = fileHits.filter((hit) => isSameHit(hit, firstHit, loopCallsAreHits));
  const hitboxes = config.abilityHitboxesMap.get(abilityName) ?? [];
  const isHitboxJoined = hitboxes.length === queuedHits.length;
  add(`${path}.hits.length`, queuedHits.length, toFile(firstHit.file), firstHit.callLine);
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
