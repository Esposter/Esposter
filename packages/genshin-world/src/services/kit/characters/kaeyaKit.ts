import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, A1: each enemy Frostgnaw hits heals Kaeya by 15% of his ATK
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/skill.go
const COLD_BLOODED_STRIKE_ASCENSION = 1;
const COLD_BLOODED_STRIKE_ATTACK_SHARE = 0.15;

export const KAEYA_CHARACTER_ID = 10_000_015;

// Kaeya's behaviour: Frostgnaw's hit heals him from Ascension 1, and Glacial Waltz's icicles are a summon's hits, landing
// From where he cast it and priced by him. Frostgnaw's damage against Water, A4's particles and Glacial Waltz's
// Activation knockback are not built
// Constellation 1 needs the Cryo state on each enemy his normal and charged attacks strike, which is not carried
// Constellation 2 needs each enemy defeated during Glacial Waltz, which no kit event reports
// Constellation 4 needs the shield at 20% HP, its 30% of Max HP and 20 seconds, which the kit does not build
// Constellation 6 needs one more icicle and 15 Energy on Glacial Waltz's cast, neither built
export const createKaeyaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const icicles = readHits("icicle");
  const glacialWaltzSeconds = readSeconds("glacialWaltz");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, icicles, { secondsRemaining: glacialWaltzSeconds }),
    },
    skill: {
      hits: [
        {
          healAttackShare: (combatant) =>
            combatant.ascension >= COLD_BLOODED_STRIKE_ASCENSION ? COLD_BLOODED_STRIKE_ATTACK_SHARE : 0,
        },
      ],
    },
  };
};
