import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";

import { createEquitableJudgementLength } from "#src/services/kit/characters/neuvilletteEquitableJudgement";
import { castSourcewaterDroplet } from "#src/services/kit/effects/castSourcewaterDroplet";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { getKitBodyPoint } from "#src/services/kit/getKitBodyPoint";

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
// evaluation decides its length from the Sourcewater Droplets in its pick-up area, and its waves and HP drains are
// queued as it runs. It spends no stamina. The burst's three ticks spawn the droplets the judgement picks up.
// Spiritbreath Thorn's aligned 10-second Cooldown is not built, as the skill's own twelve seconds always outlast it.
// Ascension 4's Hydro DMG Bonus is built. Not built yet: Ascension 1, which raises the judgement by the reactions it
// counts; the waves' internal cooldown, which the enum has no tag for; the end lag of the action the charge is
// cancelled into (the default is used); and his constellations. Constellation 1 needs Past Draconic Glories from the
// Ascension talent Heir to the Ancient Sea's Authority, Constellation 2 needs that talent's CRIT DMG per Past Draconic
// Glories, Constellation 4 needs Sourcewater Droplets generated when he is healed, and Constellation 6 needs
// Sourcewater Droplets and the judgement's currents.

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

// A point within the range of a centre, its radius drawn by area as gcsim's CalcRandomPointFromCenter draws it
const createDropletPoint = (
  body: KitBody,
  { forward, right }: { forward: number; right: number },
  [minimum, maximum]: [number, number],
  random: () => number,
): GroundPoint => {
  const centre = getKitBodyPoint(body, forward, right);
  const radius = Math.sqrt(minimum * minimum + random() * (maximum * maximum - minimum * minimum));
  const bearing = random() * 2 * Math.PI;
  return { x: centre.x + Math.cos(bearing) * radius, z: centre.z + Math.sin(bearing) * radius };
};

export const createNeuvilletteKitBehaviour = ({
  kit,
  readHits,
}: Pick<KitRecordReader, "kit" | "readHits">): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      kit.elementalBurst.hits.forEach(({ hitmarkSeconds }, index) => {
        const droplets = DROPLET_TICKS[index];
        if (!droplets) return;
        scheduleKitTask(kitEffectState, characterId, hitmarkSeconds, (tick) => {
          for (const offset of droplets.offsets)
            castSourcewaterDroplet(
              tick.kitEffectState,
              characterId,
              createDropletPoint(tick.body, offset, droplets.range, tick.random),
            );
        });
      });
    },
  },
  chargedAttack: { decideLength: createEquitableJudgementLength(() => readHits("judgement")) },
  getPassiveBonuses,
});
