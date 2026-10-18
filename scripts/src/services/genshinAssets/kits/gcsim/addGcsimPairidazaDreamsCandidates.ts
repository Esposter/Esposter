import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// The `Abil` of Kaveh's Constellation 6 literal in cons.go, which the queue call firing it names by its variable
const PAIRIDAZA_DREAMS_ABIL = "Pairidaeza's Dreams (C6)";

// Kaveh's Constellation 6 hit: its literal's multiplier, the circle on the target its queue call's hitbox gives, and the
// Frames its queue call's delay gives, as gcsim's cons.go queues it on each Normal, Charged or Plunging Attack that hits
export const addGcsimPairidazaDreamsCandidates = (
  { add, addHit, addNoPoiseRule, toFile }: GcsimKitCandidateWriter,
  { attacks, queuedAttacks }: GcsimCharacter,
): void => {
  const attack = attacks.find(({ abil }) => abil === PAIRIDAZA_DREAMS_ABIL);
  if (attack === undefined) return;
  const queuedAttack = queuedAttacks.find((call) => findQueuedAttack(attacks, call) === attack);
  if (attack.mult !== undefined)
    add("hits.pairidazaDreams.multiplier", attack.mult, toFile(attack.file), attack.fieldLineMap.Mult ?? attack.line);
  // Gcsim's literal sets no PoiseDMG, so the hit deals none, as a named hit without poise does
  if (attack.poiseDamage === undefined) addNoPoiseRule("hits.pairidazaDreams.poiseDamage");
  addHit(
    "hits.pairidazaDreams",
    {
      areaHitbox: queuedAttack?.hitbox ?? queuedAttack?.struckEnemyHitbox,
      attack,
      hitmark:
        queuedAttack?.delay === undefined
          ? undefined
          : { file: queuedAttack.file, line: queuedAttack.delayLine, value: queuedAttack.delay },
    },
    // The hit is priced from the reach of the Normal and Charged Attacks that trigger it, which find the target within it
    STRIKE_TARGETING_AREA,
  );
};
