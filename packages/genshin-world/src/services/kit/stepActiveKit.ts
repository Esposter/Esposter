import type { Enemy } from "#src/models/enemy/Enemy";
import type { ActiveKitControls } from "#src/models/kit/ActiveKitControls";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { readOreHit } from "#src/services/gathering/readOreHit";
import { burstKitDendroCores } from "#src/services/kit/burstKitDendroCores";
import { checkKitActionLanded } from "#src/services/kit/checkKitActionLanded";
import { copyKitBody } from "#src/services/kit/copyKitBody";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { endKitSwapEffects } from "#src/services/kit/effects/endKitSwapEffects";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { infuseKitHit } from "#src/services/kit/effects/infuseKitHit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { gainKitAttackEnergy } from "#src/services/kit/gainKitAttackEnergy";
import { getKitSkillActions } from "#src/services/kit/getKitSkillActions";
import { pickUpCrystallizeShards } from "#src/services/kit/pickUpCrystallizeShards";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { sendKitOutbox } from "#src/services/kit/sendKitOutbox";
import { stepDeployedKits } from "#src/services/kit/stepDeployedKits";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeElementalTicks } from "#src/services/kit/strikeElementalTicks";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { strikeLunarChargedCloud } from "#src/services/kit/strikeLunarChargedCloud";
import { strikeMoondriftHarmonyHits } from "#src/services/kit/strikeMoondriftHarmonyHits";
import { tickEnemyStatuses } from "#src/services/kit/tickEnemyStatuses";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { lightAscendantGleam } from "#src/services/party/lightAscendantGleam";
import { stepMoondrifts } from "#src/services/party/stepMoondrifts";
import { stepVerdantDew } from "#src/services/party/stepVerdantDew";
import { readPuzzleHit } from "#src/services/puzzle/readPuzzleHit";
import { takeOne } from "@esposter/shared";

// One fixed step of the kit of the character on the field, after its body has stepped, written in place on the world's
// Combat state: a swap since the last step and the events raised since, the strikes the team's taunts took among them,
// The team's effects that run out, the statuses on the enemies that fall due and a burst that starts are sent to the
// Deployed team's kits, the party's Verdant Dew gathers and its Moondrifts run down, the Crystallize shards in reach of
// The body are picked up, the ticks the enemies' elements brought since, the party's Lunar-Charged cloud and the
// Moondrift Harmony hits due strike and the Dendro Cores whose seconds ran out burst, the kit plays the step's presses
// As its stance, if it holds one, plays them, a skill or burst that starts Lights Ascendant Gleam, an action that
// Starts turns the body to the enemy it targets, or to the camera's aim for an aimed shot, and every hit the step lands
// Strikes the Ores, the Dendro Cores and the enemies in its area, a normal or charged attack's that struck an enemy
// Rolling for its Energy, the ores an Overloaded's explosion reached are struck, and the changes to the members' HP are
// Sent last. A character whose combatant is not built yet, its talent multipliers still in flight, plays nothing until
// They arrive. The body and every list the step fills are the context's and the controls' own, written in place and
// Emptied by their length, so a step where nothing lands allocates nothing
export const stepActiveKit = (
  kitState: KitState,
  input: KitInput,
  stepSeconds: number,
  context: KitContext,
  {
    aimYaw,
    characterController,
    isAimHeld,
    landedHits,
    strikeOre,
    strikePuzzle,
    triggerHealthChange,
    triggerReaction,
  }: ActiveKitControls,
): void => {
  const {
    body,
    characterIdCombatantMap,
    enemyMap,
    expiredEffects,
    kitEffectState,
    oreStrikes,
    outbox,
    party,
    random,
    strikes,
  } = context;
  const characterId = getActiveCharacterId(party);
  const fieldCombatant = characterIdCombatantMap.get(characterId);
  if (!fieldCombatant) return;
  const combatant = findKitStance(kitEffectState.effects, characterId)?.combatant ?? fieldCombatant;
  const { kit } = combatant;
  const { position } = characterController;
  body.facing = characterController.facing;
  body.height = input.height;
  body.position = position;
  context.activeCombatant = combatant;
  const { fieldCharacterId } = kitEffectState;
  kitEffectState.fieldCharacterId = characterId;
  if (fieldCharacterId !== characterId) {
    if (fieldCharacterId !== undefined) endKitSwapEffects(kitEffectState.effects, fieldCharacterId);
    emitKitEvent({ characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId: fieldCharacterId }, context);
  }
  sendKitOutbox(context);
  stepKitEffects(stepSeconds, context);
  for (const effect of expiredEffects) emitKitEvent({ effect, kind: KitEventKind.EffectExpired }, context);
  stepDeployedKits(context, stepSeconds);
  stepVerdantDew(party, stepSeconds);
  stepMoondrifts(party, stepSeconds);
  pickUpCrystallizeShards(kitEffectState, position);
  tickEnemyStatuses(enemyMap.values(), stepSeconds, outbox);
  sendKitOutbox(context);
  strikeElementalTicks(context);
  strikeLunarChargedCloud(stepSeconds, position, context);
  strikeMoondriftHarmonyHits(stepSeconds, context);
  burstKitDendroCores(expiredEffects, context);
  const infusion = getKitInfusion(kitEffectState.effects, characterId);
  const action = stepKit(
    kitState,
    kit,
    input,
    getPartyMember(party, characterId),
    characterController.stamina,
    stepSeconds,
    landedHits,
    context,
  );
  // A started action turns the body to the enemy it targets, and the hits that follow are drawn from the turned body.
  // An aimed shot instead turns it to the camera's aim while the aim is held, as the bow's aim binding is
  let target: Enemy | undefined;
  if (action?.isAimed && isAimHeld) {
    characterController.face(aimYaw);
    body.facing = characterController.facing;
  } else if (action) {
    target = selectAttackTarget(action.targetingArea, body, enemyMap.values());
    if (target) {
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      characterController.face(Math.atan2(-dx, -dz));
      body.facing = characterController.facing;
    }
  }

  // A burst is sent to the team's kits as it starts, ahead of its own start, as gcsim announces a burst before it plays
  const isBurst =
    action !== undefined && (action === kit.elementalBurst || action === kit.elementalBurstVariant?.action);
  if (isBurst) emitKitEvent({ characterId, energyCost: kit.burstEnergyCost, kind: KitEventKind.BurstUsed }, context);
  const isSkill = action !== undefined && getKitSkillActions(kit).includes(action);
  if (isSkill) emitKitEvent({ characterId, kind: KitEventKind.SkillUsed }, context);
  if (isBurst || isSkill) lightAscendantGleam(kitEffectState, combatant, characterIdCombatantMap, party);
  // A start keeps the body it began from, as a field or summon it casts ticks from where it began, not where the body
  // Has moved
  action?.onStart?.({ ...context, body: copyKitBody(body) }, target);
  if (action) coordinateKitSummons(action, context);
  // The ores are struck by the hits as the kit gives them, before an infusion copies them
  for (const hit of landedHits) strikeOre(body, readOreHit(combatant, hit));
  for (const hit of landedHits) strikePuzzle(body, readPuzzleHit(combatant, hit));
  // A normal attack's first hit lands in the attack's seconds or, past them, from the summon its end queued it on
  if (landedHits.length > 0 || strikes.length > 0)
    for (const normalAttack of kit.normalAttacks)
      if (checkKitActionLanded(normalAttack, landedHits, strikes))
        emitKitEvent({ action: normalAttack, kind: KitEventKind.NormalAttackLanded }, context);
  if (checkKitActionLanded(kit.chargedAttack, landedHits, strikes))
    emitKitEvent({ action: kit.chargedAttack, kind: KitEventKind.ChargedAttackLanded }, context);
  // The summons' hits land from their own bodies, priced by the combatants that cast them and infused by their
  // Infusions, and the step's own hits from the turned body and the character on the field, infused by the infusion it
  // Started with
  for (const strike of strikes) {
    const strikeInfusion = getKitInfusion(kitEffectState.effects, strike.combatant.characterId);
    if (strikeInfusion !== undefined) strike.hit = infuseKitHit(strike.hit, strikeInfusion);
  }
  for (const hit of landedHits)
    strikes.push({
      attackTag: hit.attackTag,
      body,
      combatant,
      hit: infusion === undefined ? hit : infuseKitHit(hit, infusion),
      ...(action?.isAimed ? { isAimed: true } : {}),
    });
  landedHits.length = 0;
  if (strikes.length > 0) {
    strikeKitEnemies(strikes, context);
    gainKitAttackEnergy(kitState, strikes, party, random);
  }
  // The ores the step's reactions reached are struck once every strike has landed, from where each reaction landed
  for (const oreStrike of oreStrikes) strikeOre(oreStrike.body, oreStrike.hit);
  oreStrikes.length = 0;
  for (const { enemy, reactions } of context.reactionTriggers) triggerReaction(enemy, reactions);
  context.reactionTriggers.length = 0;
  // The changes to the members' HP since the last step are sent last, so the step's own heals and drains are heard in
  // It, and a change a kit makes as it hears one is sent at the next step
  const { healthChanges } = party;
  const sentCount = healthChanges.length;
  for (let index = 0; index < sentCount; index++) {
    const healthChange = takeOne(healthChanges, index);
    triggerHealthChange(healthChange);
    emitKitEvent({ ...healthChange, kind: KitEventKind.HealthChanged }, context);
  }
  healthChanges.copyWithin(0, sentCount);
  healthChanges.length -= sentCount;
};
