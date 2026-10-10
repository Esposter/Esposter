import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { readOreHits } from "#src/services/gathering/readOreHits";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";

// One fixed step of the kit of the character on the field, after its body has stepped, written in place: the team's
// Effects run on, the kit plays the step's presses, an action that starts turns the body to the enemy it targets, or to
// The camera's aim for an aimed shot, and every hit the step lands strikes the ores and the enemies in its area. A
// Character whose combatant is not built yet, its talent multipliers still in flight, plays nothing until they arrive
export const stepActiveKit = (
  kitState: KitState,
  input: KitInput,
  stepSeconds: number,
  context: ActiveKitStepContext,
): void => {
  const {
    aimYaw,
    characterController,
    characterIdCombatantMap,
    enemyMap,
    enemyTables,
    isAimHeld,
    kitEffectState,
    landedHits,
    party,
    random,
    strikeOre,
  } = context;
  const characterId = getActiveCharacterId(party);
  const combatant = characterIdCombatantMap.get(characterId);
  if (!combatant) return;
  const { position } = characterController;
  const kitBody: KitBody = { facing: characterController.facing, height: input.height, position };
  const summonStrikes = stepKitEffects(kitEffectState, stepSeconds, {
    activeCombatant: combatant,
    body: kitBody.position,
    party,
  });
  const infusion = getKitInfusion(kitEffectState.effects, characterId);
  const landedStart = landedHits.length;
  const action = stepKit(
    kitState,
    combatant.kit,
    input,
    getPartyMember(party, characterId),
    characterController.stamina,
    stepSeconds,
    landedHits,
    { body: kitBody, combatant, kitEffectState },
  );
  // The ores are struck by the hits as the kit gives them, before an infusion copies them
  const landedOreHits = landedHits.length > landedStart ? readOreHits(combatant, landedHits.slice(landedStart)) : [];
  if (infusion !== undefined) infuseKitHits(combatant.kit, infusion, landedHits, landedStart);
  // A started action turns the body to the enemy it targets, and the hits that follow are drawn from the turned body. An
  // Aimed shot instead turns it to the camera's aim while the aim is held, as the bow's aim binding is
  if (action?.isAimed && isAimHeld) {
    characterController.face(aimYaw);
    kitBody.facing = characterController.facing;
  } else if (action) {
    const target = selectAttackTarget(action.targetingArea, kitBody, enemyMap.values());
    if (target) {
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      characterController.face(Math.atan2(-dx, -dz));
      kitBody.facing = characterController.facing;
    }
  }

  action?.onStart?.({ body: kitBody, combatant, kitEffectState });
  if (action) coordinateKitSummons(action, { body: kitBody, combatant, kitEffectState });
  for (const oreHit of landedOreHits) strikeOre(kitBody, oreHit);
  // The summons' hits land from their own bodies, priced by the combatants that cast them, and the step's own hits from
  // The turned body and the character on the field
  const strikes: KitStrike[] = [
    ...summonStrikes,
    ...landedHits.map((hit): KitStrike => ({ body: kitBody, combatant, hit })),
  ];
  landedHits.length = 0;
  for (const { body: strikeBody, combatant: strikeCombatant, hit, target } of strikes) {
    const pricedCombatant = getBuffedCombatant(strikeCombatant, kitEffectState.effects);
    // A hit's party heal rolls on each enemy it strikes until one roll passes
    let isPartyHealed = false;
    for (const enemy of enemyMap.values()) {
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        (target ? target !== enemy : !checkIsInAttackArea(hit.hitArea, strikeBody, enemy))
      )
        continue;
      addEnduringRockStatus(enemy, pricedCombatant, kitEffectState.effects);
      const { energyDrops, reactions } = strikeEnemy(enemyTables, enemy, hit, pricedCombatant, random);
      for (const energyDrop of energyDrops)
        gainPartyEnergy(party, energyDrop, strikeCombatant.element, characterIdCombatantMap);
      addSprawlingGreeneryBuffs(kitEffectState, party, pricedCombatant, reactions);
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, hit);
      healKitStriker(party, pricedCombatant, hit);
      hit.onStrike?.({ body: strikeBody, combatant: strikeCombatant, kitEffectState });
      if (!isPartyHealed)
        isPartyHealed = healKitParty(
          party,
          characterIdCombatantMap,
          kitEffectState.effects,
          pricedCombatant,
          hit,
          random,
        );
    }
  }
};
