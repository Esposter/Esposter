import type { Kit, KitAction, KitHit, TalentMultiplierMap } from "genshin-world";

import {
  createCircleReach,
  getTalentMultiplier,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  TALENT_START_LEVEL,
} from "genshin-world";

const SAMPLE_ATTACK_GROUP_ID = 9991;
const SAMPLE_SKILL_GROUP_ID = 9992;
const MARK_HITMARK_FRAMES = 30;
const ECHO_DELAY_FRAMES = 12;
const ECHO_POISE_DAMAGE = 15;
const MARK_HIT_AREA = createCircleReach(0, 3);
const ECHO_HIT_AREA = createCircleReach(0, 4);

const createStrikeHit = (talentMultiplierMap: TalentMultiplierMap, index: number): KitHit => ({
  hitArea: createCircleReach(0, 2),
  hitmarkSeconds: 10 / 60,
  poiseDamage: 10,
  talentMultiplier: getTalentMultiplier(talentMultiplierMap, SAMPLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
});

const createStrike = (talentMultiplierMap: TalentMultiplierMap, index: number): KitAction => ({
  hits: [createStrikeHit(talentMultiplierMap, index)],
  seconds: 20 / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// A kit for the analysis to read as its record holds it: a skill that lands a mark held whole as it starts and an echo
// Built as it plays, whose poise turns on its target, and a cooldown a constellation shortens by a share derived from a
// Talent read
export const createSampleKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const markHit: KitHit = {
    hitArea: MARK_HIT_AREA,
    hitmarkSeconds: MARK_HITMARK_FRAMES / 60,
    poiseDamage: 20,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, SAMPLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const echoMultiplier = getTalentMultiplier(talentMultiplierMap, SAMPLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 1);
  const cooldownShare = 1 - getTalentMultiplier(talentMultiplierMap, SAMPLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 2);
  const strike = createStrike(talentMultiplierMap, 0);
  return {
    burstCooldownSeconds: 15,
    burstEnergyCost: 60,
    chargedAttack: strike,
    chargedAttackStamina: 20,
    elementalBurst: strike,
    elementalSkill: {
      hits: [],
      onStart: ({ activeCombatant, body, strikes }, target) => {
        const echoSeconds = (MARK_HITMARK_FRAMES + ECHO_DELAY_FRAMES) / 60;
        strikes.push(
          { body, combatant: activeCombatant, hit: markHit },
          {
            body,
            combatant: activeCombatant,
            hit: {
              hitArea: ECHO_HIT_AREA,
              hitmarkSeconds: echoSeconds,
              poiseDamage: target === undefined ? 0 : ECHO_POISE_DAMAGE,
              talentMultiplier: echoMultiplier,
            },
          },
        );
      },
      seconds: 40 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getSkillCooldownMultiplier: ({ activeCombatant }) => (activeCombatant.constellationCount > 0 ? cooldownShare : 1),
    highPlunge: strike,
    lowPlunge: strike,
    normalAttacks: [strike, createStrike(talentMultiplierMap, 1)],
    plungeCollision: createStrikeHit(talentMultiplierMap, 0),
    skillCooldownSeconds: 6,
  };
};
