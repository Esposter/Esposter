import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createEquitableJudgementLength } from "#src/services/kit/characters/neuvilletteEquitableJudgement";
import { NEUVILLETTE_CHARACTER_ID } from "#src/services/kit/characters/neuvilletteKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castSourcewaterDroplet } from "#src/services/kit/effects/castSourcewaterDroplet";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const NEUVILLETTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEUVILLETTE_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: NEUVILLETTE_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: NEUVILLETTE_KIT,
  level: 90,
};

// The judgement's eight waves, their hitmarks counted from the start of the judgement, as gcsim's ticks land them
const WAVE_FRAMES = [6, 28, 53, 78, 103, 128, 153, 173];
const createWave = (hitmarkFrames: number): KitHit => ({
  element: Element.Hydro,
  gauge: 1,
  hitArea: { angle: 2 * Math.PI, height: 2, radius: 15.1 },
  hitmarkSeconds: hitmarkFrames / 60,
  poiseDamage: 0,
  talentMultiplier: 0.073186,
});
const waves = WAVE_FRAMES.map(createWave);

// The frames, counted from the step after the length is decided, on which a strike lands
const getLandingFrames = (context: KitContext, frames: number): number[] => {
  const landingFrames: number[] = [];
  for (let frame = 1; frame <= frames; frame++) {
    stepKitSeconds(context, FIXED_STEP_SECONDS);
    if (context.strikes.length > 0) landingFrames.push(frame);
  }
  return landingFrames;
};

describe(createEquitableJudgementLength, () => {
  test("lasts the whole judgement with no droplet in its pick-up area, and less as its legal evaluation picks droplets up", () => {
    expect.hasAssertions();

    const lengthAfter = (droplets: number, outside: number) => {
      const context = createKitTestContext(wielder);
      for (let index = 0; index < droplets; index++)
        castSourcewaterDroplet(context.kitEffectState, NEUVILLETTE_CHARACTER_ID, { x: 0, z: -1 - index });
      for (let index = 0; index < outside; index++)
        castSourcewaterDroplet(context.kitEffectState, NEUVILLETTE_CHARACTER_ID, { x: 0, z: 20 });
      return createEquitableJudgementLength(() => waves).decide(context) * 60;
    };
    expect([lengthAfter(0, 0), lengthAfter(1, 0), lengthAfter(3, 1)]).toStrictEqual([436, 379, 227]);
  });

  test("lands each wave at the legal evaluation's end plus its own frames", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    createEquitableJudgementLength(() => waves).decide(context);
    expect(getLandingFrames(context, 383)).toStrictEqual([215, 237, 262, 287, 312, 337, 362, 382]);
  });

  test("heals an absorbed droplet's 16% of Max HP five frames after the length is decided", () => {
    expect.hasAssertions();

    // A wielder with a Max HP to heal by, as the bare fixture above has none
    const context = createKitTestContext({ ...wielder, attributes: { ...wielder.attributes, maxHealth: 10_000 } });
    const getHealthShare = () => {
      const member = context.party.characterIdMemberMap.get(NEUVILLETTE_CHARACTER_ID);
      if (!member) throw new Error("the wielder is not in the party");
      return member.healthShare;
    };
    const member = context.party.characterIdMemberMap.get(NEUVILLETTE_CHARACTER_ID);
    if (!member) throw new Error("the wielder is not in the party");
    member.healthShare = 0.5;
    castSourcewaterDroplet(context.kitEffectState, NEUVILLETTE_CHARACTER_ID, { x: 0, z: -1 });
    createEquitableJudgementLength(() => []).decide(context);
    stepKitSeconds(context, 4 * FIXED_STEP_SECONDS);
    expect(getHealthShare()).toBe(0.5);
    stepKitSeconds(context, FIXED_STEP_SECONDS);
    expect(getHealthShare()).toBeCloseTo(0.66, 9);
  });
});
