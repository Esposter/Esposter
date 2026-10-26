import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createEquitableJudgementLength } from "#src/services/kit/characters/neuvilletteEquitableJudgement";
import { createSourcewaterDropletPoint } from "#src/services/kit/createSourcewaterDropletPoint";
import { castSourcewaterDroplet } from "#src/services/kit/effects/castSourcewaterDroplet";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

export const NEUVILLETTE_CHARACTER_ID = 10_000_087;

// Measured: gcsim v2.47.2 (MIT) neuvillette/asc.go, Ascension 4 gives a Hydro DMG Bonus of 0.6 for each unit of HP share
// Above 30%, at most 30%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_HEALTH_SHARE_FLOOR = 0.3;
const ASCENSION_4_HYDRO_DAMAGE_BONUS_PER_HEALTH_SHARE = 0.6;
const ASCENSION_4_HYDRO_DAMAGE_BONUS_MAX = 0.3;

// Ascension 4's Hydro DMG Bonus, read from the character's HP as a share of its Max HP, as a passive bonus is priced
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4
    ? []
    : [
        {
          amount: Math.min(
            ASCENSION_4_HYDRO_DAMAGE_BONUS_MAX,
            Math.max(
              0,
              (healthShare - ASCENSION_4_HEALTH_SHARE_FLOOR) * ASCENSION_4_HYDRO_DAMAGE_BONUS_PER_HEALTH_SHARE,
            ),
          ),
          attribute: Attribute.HydroDamageBonus,
        },
      ];

// Neuvillette's behaviour: his strikes, his plunges, O Tears, I Shall Repay with its Spiritbreath Thorn and O Tides, I
// Have Returned with its Waterfalls are his record's alone. His charged attack is Equitable Judgment, held: its legal
// Evaluation decides its length from the Sourcewater Droplets in its pick-up area, and its waves and HP drains are
// Queued as it runs. It spends no stamina. The burst's three ticks spawn the droplets the judgement picks up.
// Spiritbreath Thorn's aligned 10-second Cooldown is not built, as the skill's own twelve seconds always outlast it.
// Ascension 4's Hydro DMG Bonus and Constellation 4's droplet on a heal are built. Not built yet: Ascension 1, which
// Raises the judgement by the reactions it counts; the waves' internal cooldown, which the enum has no tag for; the end
// Lag of the action the charge is cancelled into (the default is used); and Constellations 1, 2 and 6. Constellation 1
// Needs Past Draconic Glories from the Ascension talent Heir to the Ancient Sea's Authority, Constellation 2 needs that
// Talent's CRIT DMG per Past Draconic Glories, and Constellation 6 needs the judgement's currents.

// Measured: gcsim v2.47.2 (MIT) neuvillette/burst.go: each of the burst's three ticks spawns three, two and one
// Sourcewater Droplets, each at a random point within its range of its offset from the player, ahead and to its side.
// The ticks land at the burst's own hits' hitmarks, which the record holds.
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/burst.go
const DROPLET_TICKS: { offsets: { forward: number; right: number }[]; range: [number, number] }[] = [
  {
    offsets: [
      { forward: 7, right: 0 },
      { forward: 7.5, right: -1 },
      { forward: 6.5, right: 0.8 },
    ],
    range: [0.5, 2],
  },
  {
    offsets: [
      { forward: 7.5, right: -3.5 },
      { forward: 6, right: -2.5 },
    ],
    range: [0.5, 1.2],
  },
  { offsets: [{ forward: 6, right: 3.3 }], range: [0.5, 1.2] },
];

// Measured: gcsim v2.47.2 (MIT) neuvillette/cons.go, Constellation 4 spawns a Sourcewater Droplet 8 metres ahead of him, at
// 1.3 to 3 metres from that point, each time he is healed on the field, once every 4 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DROPLET_FORWARD = 8;
const CONSTELLATION_4_DROPLET_RANGE: [number, number] = [1.3, 3];
const CONSTELLATION_4_ICD_ID = "neuvillette-c4-icd";
const CONSTELLATION_4_ICD_SECONDS = 4;

export const createNeuvilletteKitBehaviour = ({
  kit,
  readHits,
}: Pick<KitRecordReader, "kit" | "readHits">): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      for (const [index, { hitmarkSeconds }] of kit.elementalBurst.hits.entries()) {
        const droplets = DROPLET_TICKS[index];
        if (!droplets) continue;
        scheduleKitTask(kitEffectState, characterId, hitmarkSeconds, (tick) => {
          for (const offset of droplets.offsets)
            castSourcewaterDroplet(
              tick.kitEffectState,
              characterId,
              createSourcewaterDropletPoint(tick.body, offset, droplets.range, tick.random),
            );
        });
      }
    },
  },
  chargedAttack: { decideLength: createEquitableJudgementLength(readHits("judgement")) },
  getPassiveBonuses,
  // Constellation 4 is read from the heals that restore him while he is on the field, from any healer
  onKitEvent: (event, { activeCombatant, body, kitEffectState, random }, combatant) => {
    if (event.kind !== KitEventKind.HealthChanged) return;
    const { characterId, constellationCount } = combatant;
    if (
      constellationCount < CONSTELLATION_4 ||
      event.characterId !== characterId ||
      event.healthShare <= 0 ||
      activeCombatant.characterId !== characterId ||
      !startKitCooldown(kitEffectState, characterId, CONSTELLATION_4_ICD_ID, CONSTELLATION_4_ICD_SECONDS)
    )
      return;
    castSourcewaterDroplet(
      kitEffectState,
      characterId,
      createSourcewaterDropletPoint(
        body,
        { forward: CONSTELLATION_4_DROPLET_FORWARD, right: 0 },
        CONSTELLATION_4_DROPLET_RANGE,
        random,
      ),
    );
  },
});
