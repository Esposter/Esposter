import type { Enemy } from "#src/models/enemy/Enemy";
import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { readOreHits } from "#src/services/gathering/readOreHits";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { getStancedKit } from "#src/services/kit/effects/getStancedKit";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getKitAttackTag } from "#src/services/kit/getKitAttackTag";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { tickEnemyStatuses } from "#src/services/kit/tickEnemyStatuses";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";

// One fixed step of the kit of the character on the field, after its body has stepped, written in place: a swap since
// The last step, the team's effects that run out and the statuses on the enemies that fall due are sent to the deployed
// Team's kits, the kit plays the step's presses as its stance, if it holds one, plays them, an action that starts turns
// The body to the enemy it targets, or to the camera's aim for an aimed shot, and every hit the step lands strikes the
// Ores and the enemies in its area. A character whose combatant is not built yet, its talent multipliers still in
// Flight, plays nothing until they arrive
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
  const fieldCombatant = characterIdCombatantMap.get(characterId);
  if (!fieldCombatant) return;
  const kit = getStancedKit(fieldCombatant.kit, kitEffectState.effects, characterId);
  const combatant = kit === fieldCombatant.kit ? fieldCombatant : { ...fieldCombatant, kit };
  const { position } = characterController;
  const kitBody: KitBody = { facing: characterController.facing, height: input.height, position };
  const emit = (event: KitEvent): void =>
    emitKitEvent(event, characterIdCombatantMap, {
      activeCombatant: combatant,
      body: kitBody,
      enemyMap,
      kitEffectState,
      party,
      random,
    });
  const { fieldCharacterId } = kitEffectState;
  kitEffectState.fieldCharacterId = characterId;
  if (fieldCharacterId !== undefined && fieldCharacterId !== characterId)
    emit({ characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId: fieldCharacterId });
  const expiredEffects: KitEffect[] = [];
  const summonStrikes = stepKitEffects(
    kitEffectState,
    stepSeconds,
    { activeCombatant: combatant, body: kitBody.position, party },
    expiredEffects,
  );
  for (const effect of expiredEffects) emit({ effect, kind: KitEventKind.EffectExpired });
  for (const event of tickEnemyStatuses(enemyMap.values(), stepSeconds)) emit(event);
  const infusion = getKitInfusion(kitEffectState.effects, characterId);
  const landedStart = landedHits.length;
  const action = stepKit(
    kitState,
    kit,
    input,
    getPartyMember(party, characterId),
    characterController.stamina,
    stepSeconds,
    landedHits,
    { body: kitBody, combatant, kitEffectState },
  );
  // The ores are struck by the hits as the kit gives them, and each hit's kind of attack is read, before an infusion
  // Copies them
  const stepHits = landedHits.slice(landedStart);
  const landedOreHits = stepHits.length > 0 ? readOreHits(combatant, stepHits) : [];
  const attackTags = landedHits.map((hit) => getKitAttackTag(kit, hit));
  if (infusion !== undefined) infuseKitHits(kit, infusion, landedHits, landedStart);
  // A started action turns the body to the enemy it targets, and the hits that follow are drawn from the turned body. An
  // Aimed shot instead turns it to the camera's aim while the aim is held, as the bow's aim binding is
  let target: Enemy | undefined;
  if (action?.isAimed && isAimHeld) {
    characterController.face(aimYaw);
    kitBody.facing = characterController.facing;
  } else if (action) {
    target = selectAttackTarget(action.targetingArea, kitBody, enemyMap.values());
    if (target) {
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      characterController.face(Math.atan2(-dx, -dz));
      kitBody.facing = characterController.facing;
    }
  }

  action?.onStart?.({ body: kitBody, combatant, kitEffectState, target });
  if (action) coordinateKitSummons(action, { body: kitBody, combatant, kitEffectState });
  for (const oreHit of landedOreHits) strikeOre(kitBody, oreHit);
  for (const normalAttack of kit.normalAttacks) {
    const [firstHit] = normalAttack.hits;
    if (firstHit && stepHits.includes(firstHit)) emit({ action: normalAttack, kind: KitEventKind.NormalAttackLanded });
  }
  // The summons' hits land from their own bodies, priced by the combatants that cast them, and the step's own hits from
  // The turned body and the character on the field
  const strikes: KitStrike[] = [
    ...summonStrikes,
    ...landedHits.map((hit, index): KitStrike => ({ attackTag: attackTags[index], body: kitBody, combatant, hit })),
  ];
  landedHits.length = 0;
  strikeKitEnemies(strikes, { characterIdCombatantMap, emit, enemyMap, enemyTables, kitEffectState, party, random });
};
