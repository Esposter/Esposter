import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsKitSecretRite } from "#src/services/kit/checkIsKitSecretRite";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { extendKitStatus } from "#src/services/kit/effects/extendKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const PATH_OF_CONFLICT_ID = "pathOfConflict";
const PATH_OF_CONFLICT_COOLDOWN_ID = "pathOfConflictCooldown";
const UNFORGIVABLE_ID = "unforgivable";
const IRREPARABLE_ID = "irreparable";
const ATTACK_EXTENSION_COOLDOWN_ID = "dolorousStrokeAttackExtensionCooldown";
const SKILL_EXTENSION_COOLDOWN_ID = "dolorousStrokeSkillExtensionCooldown";
// The seconds between two extensions of either kind, the text's own figure, as gcsim's 0.1 s statuses hold them
const EXTENSION_COOLDOWN_SECONDS = 0.1;
const ATTACK_TAGS = new Set<AttackTag | undefined>([AttackTag.NormalAttack, AttackTag.ChargedAttack]);
const SKILL_TAGS = new Set<AttackTag | undefined>([AttackTag.ElementalSkill, AttackTag.ElementalBurst]);

// The status a hit of the given kind extends, with the cooldown its extensions keep: a normal or charged attack's
// Irreparable, a skill's or burst's Unforgivable, and none for any other hit
const getExtendedStatus = (attackTag: AttackTag | undefined): { cooldownId: string; id: string } | undefined => {
  if (ATTACK_TAGS.has(attackTag)) return { cooldownId: ATTACK_EXTENSION_COOLDOWN_ID, id: IRREPARABLE_ID };
  if (SKILL_TAGS.has(attackTag)) return { cooldownId: SKILL_EXTENSION_COOLDOWN_ID, id: UNFORGIVABLE_ID };
  return undefined;
};

// Dolorous Stroke (Disaster and Remorse) at its rank: the wielder's Elemental Skill gives it Path of Conflict for the
// Rank's seconds, and Unforgivable and Irreparable for the rank's shorter seconds, once every rank's cooldown, all
// Three ended as it leaves the field. Unforgivable raises the DMG of its normal and charged attacks, and Irreparable of
// Its skill and burst, by the rank's amounts, and by the rank's share more while the team holds Hexerei: Secret Rite.
// While the Path holds, a normal or charged attack hit of its own extends Irreparable, and a skill or burst hit
// Unforgivable, by the rank's extension, each once every 0.1 seconds, and the Path's end ends both, as gcsim's
// Disasterandremorse.go queues their removal as the Path runs out
export const createDolorousStrokePassiveModule = (params: number[]): PassiveModule => {
  const pathOfConflictSeconds = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const attackDamageBonus = takeOne(params, 2);
  const skillDamageBonus = takeOne(params, 3);
  const extensionSeconds = takeOne(params, 4);
  const secretRiteShare = takeOne(params, 5);
  const cooldownSeconds = takeOne(params, 6);
  return {
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, party, effects) => {
      const { characterId } = combatant;
      const multiplier = checkIsKitSecretRite(getDeployedCharacterIds(party)) ? 1 + secretRiteShare : 1;
      if (ATTACK_TAGS.has(attackTag) && checkIsKitStatusActive(effects, characterId, UNFORGIVABLE_ID))
        return attackDamageBonus * multiplier;
      if (SKILL_TAGS.has(attackTag) && checkIsKitStatusActive(effects, characterId, IRREPARABLE_ID))
        return skillDamageBonus * multiplier;
      return 0;
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.SkillUsed) {
        if (
          event.characterId !== characterId ||
          !startKitCooldown(kitEffectState, characterId, PATH_OF_CONFLICT_COOLDOWN_ID, cooldownSeconds)
        )
          return;
        addKitStatus(kitEffectState, characterId, {
          id: PATH_OF_CONFLICT_ID,
          isEndedOnSwap: true,
          secondsRemaining: pathOfConflictSeconds,
        });
        for (const id of [UNFORGIVABLE_ID, IRREPARABLE_ID])
          addKitStatus(kitEffectState, characterId, { id, isEndedOnSwap: true, secondsRemaining: seconds });
        return;
      }
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind !== "status" || effect.characterId !== characterId || effect.id !== PATH_OF_CONFLICT_ID) return;
        for (const id of [UNFORGIVABLE_ID, IRREPARABLE_ID]) endKitStatus(kitEffectState, characterId, id);
        return;
      }
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.striker.characterId !== characterId ||
        !checkIsKitStatusActive(kitEffectState.effects, characterId, PATH_OF_CONFLICT_ID)
      )
        return;
      const extendedStatus = getExtendedStatus(event.attackTag);
      if (
        !extendedStatus ||
        !startKitCooldown(kitEffectState, characterId, extendedStatus.cooldownId, EXTENSION_COOLDOWN_SECONDS)
      )
        return;
      extendKitStatus(kitEffectState, characterId, extendedStatus.id, {
        maximumSeconds: Number.POSITIVE_INFINITY,
        seconds: extensionSeconds,
      });
    },
  };
};
