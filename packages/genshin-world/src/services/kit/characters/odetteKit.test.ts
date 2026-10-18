import type { Reaction } from "#src/models/combat/Reaction";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { buildKit } from "#src/services/kit/buildKit";
import { createOdetteKitBehaviour, ODETTE_CHARACTER_ID } from "#src/services/kit/characters/odetteKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createOdetteKitBehaviour, () => {
  const PROUD_SKILL_GROUP_ID = 1;
  const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = { [PROUD_SKILL_GROUP_ID]: [{ level: 1, paramList: [0.5] }] };
  const HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkFrames: 12,
    multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    poiseDamage: 0,
  };
  const createActionRecord = (): KitActionRecord => ({
    animationFrames: 30,
    hits: [HIT_RECORD],
    targeting: KitTargeting.Strike,
  });
  const RECORD: KitRecord = {
    areas: { polestar: { angle: 2 * Math.PI, height: 2, radius: 15 } },
    burst: createActionRecord(),
    burstCooldownSeconds: 15,
    chargedAttack: createActionRecord(),
    chargedAttackStamina: 20,
    frames: { polestar: 420, polestarTick: 240, stellarVortex: 181 },
    normalAttacks: [createActionRecord()],
    plungeCollision: HIT_RECORD,
    plunges: { [KitPlunge.High]: createActionRecord(), [KitPlunge.Low]: createActionRecord() },
    skill: createActionRecord(),
    skillCooldownSeconds: 6,
    skillHolds: [],
    stellarJubilee: { stellarReactionTypes: [StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl] },
  };
  const kit: Kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, createOdetteKitBehaviour);
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    characterId: ODETTE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit,
    level: 90,
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Triggers the reactions on the enemy with Odette on the field, the body standing at the point given
  const triggerReactions = (reactions: Reaction[], bodyPosition = { x: 3, z: 4 }) => {
    const context = createKitTestContext(combatant, { body: { facing: 0, height: 0, position: bodyPosition } });
    kit.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant },
      context,
      combatant,
    );
    return context.kitEffectState.effects;
  };

  test("a Stellar-Conduct sustains its Polestar Field for 7 seconds", () => {
    expect.hasAssertions();

    const effects = triggerReactions([{ element: Element.Cryo, reactionType: ReactionType.StellarConduct }]);

    expect(
      effects.map((effect) =>
        effect.kind === "field"
          ? {
              centre: effect.centre,
              characterId: effect.characterId,
              id: effect.id,
              radius: effect.radius,
              secondsRemaining: effect.secondsRemaining,
            }
          : effect.kind,
      ),
    ).toStrictEqual([
      { centre: { x: 3, z: 4 }, characterId: ODETTE_CHARACTER_ID, id: "polestar", radius: 15, secondsRemaining: 7 },
    ]);
  });

  test("refreshes a standing Polestar Field rather than placing a second one", () => {
    expect.hasAssertions();
    const context = createKitTestContext(combatant);
    const superconduct: Reaction = { element: Element.Cryo, reactionType: ReactionType.StellarConduct };
    kit.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions: [superconduct], striker: combatant },
      context,
      combatant,
    );
    for (const effect of context.kitEffectState.effects) if (effect.kind === "field") effect.secondsRemaining = 1;
    kit.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions: [superconduct], striker: combatant },
      context,
      combatant,
    );

    expect(
      context.kitEffectState.effects.map((effect) => (effect.kind === "field" ? effect.secondsRemaining : effect.kind)),
    ).toStrictEqual([7]);
  });

  test("places a Stellar Vortex where a Stellar Swirl is triggered, and places nothing for any other reaction", () => {
    expect.hasAssertions();

    const effects = triggerReactions([
      { element: Element.Electro, reactionType: ReactionType.Swirl },
      { element: Element.Cryo, reactionType: ReactionType.StellarSwirl },
      { element: Element.Cryo, reactionType: ReactionType.Melt },
    ]);

    expect(
      effects.map((effect) =>
        effect.kind === "summon" ? { id: effect.id, secondsRemaining: effect.secondsRemaining } : effect.kind,
      ),
    ).toStrictEqual([{ id: "stellarVortex", secondsRemaining: 181 / 60 }]);
  });

  test("a Stellar Jubilee passive enables both reactions for its party", () => {
    expect.hasAssertions();

    expect(
      getPartyStellarReactionTypes(new Map([[ODETTE_CHARACTER_ID, combatant]]), createParty([ODETTE_CHARACTER_ID])),
    ).toStrictEqual([StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl]);
  });
});
