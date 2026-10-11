import type { Enemy } from "#src/models/enemy/Enemy";
import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { readOreHits } from "#src/services/gathering/readOreHits";
import { burstKitDendroCores } from "#src/services/kit/burstKitDendroCores";
import { copyKitBody } from "#src/services/kit/copyKitBody";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { getStancedKit } from "#src/services/kit/effects/getStancedKit";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { infuseKitStrike } from "#src/services/kit/effects/infuseKitStrike";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { takeKitTauntDamages } from "#src/services/kit/effects/takeKitTauntDamages";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { gainKitAttackEnergy } from "#src/services/kit/gainKitAttackEnergy";
import { getKitAttackTag } from "#src/services/kit/getKitAttackTag";
import { getKitSkillActions } from "#src/services/kit/getKitSkillActions";
import { pickUpCrystallizeShards } from "#src/services/kit/pickUpCrystallizeShards";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
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

// One fixed step of the kit of the character on the field, after its body has stepped, written in place: a swap since
// The last step, the strikes the team's taunts took since, the team's effects that run out, the statuses on the enemies
// That fall due and a burst that starts are sent to the deployed team's kits, the party's Verdant Dew gathers and its
// Moondrifts run down, the Crystallize shards in reach of the body are picked up, the ticks the enemies' elements brought
// Since, the party's Lunar-Charged cloud and the Moondrift Harmony hits due strike and the Dendro Cores whose seconds ran
// Out burst, the kit plays the step's presses as its stance, if it holds one, plays them, a skill or burst that starts
// Lights Ascendant Gleam, an action that starts turns the body to the enemy it targets, or to the camera's aim for an
// Aimed shot, and every hit the step lands strikes the Ores, the Dendro Cores and the enemies in its area, a normal or
// Charged attack's that struck an enemy rolling for its Energy, and the changes to the members' HP are sent last. A
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
  for (const event of takeKitTauntDamages(kitEffectState.effects)) emit(event);
  const expiredEffects: KitEffect[] = [];
  const summonStrikes = stepKitEffects(
    kitEffectState,
    stepSeconds,
    { activeCombatant: combatant, body: kitBody.position, characterIdCombatantMap, enemyMap, party },
    expiredEffects,
  );
  for (const effect of expiredEffects) emit({ effect, kind: KitEventKind.EffectExpired });
  stepVerdantDew(party, stepSeconds);
  stepMoondrifts(party, stepSeconds);
  pickUpCrystallizeShards(kitEffectState, position);
  for (const event of tickEnemyStatuses(enemyMap.values(), stepSeconds)) emit(event);
  const strikeContext: KitStrikeContext = { ...context, emit };
  strikeElementalTicks(strikeContext);
  strikeLunarChargedCloud(stepSeconds, position, strikeContext);
  strikeMoondriftHarmonyHits(stepSeconds, strikeContext);
  burstKitDendroCores(expiredEffects, strikeContext);
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
    { body: kitBody, combatant, kitEffectState, party, random },
  );
  // The ores are struck by the hits as the kit gives them, and each hit's kind of attack is read, before an infusion
  // Copies them
  const stepHits = landedHits.slice(landedStart);
  const landedOreHits = stepHits.length > 0 ? readOreHits(combatant, stepHits) : [];
  const attackTags = landedHits.map((hit) => getKitAttackTag(kit, hit, kitEffectState.effects));
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

  // A burst is sent to the team's kits as it starts, ahead of its own start, as gcsim announces a burst before it plays
  const isBurst =
    action !== undefined && (action === kit.elementalBurst || action === kit.elementalBurstVariant?.action);
  if (isBurst) emit({ characterId, energyCost: kit.burstEnergyCost, kind: KitEventKind.BurstUsed });
  if (action && (isBurst || getKitSkillActions(kit).includes(action)))
    lightAscendantGleam(kitEffectState, combatant, characterIdCombatantMap, party);
  // A start keeps the body it began from, as a field or summon it casts ticks from where it began, not where the body has moved
  action?.onStart?.({ body: copyKitBody(kitBody), combatant, kitEffectState, party, random, target });
  if (action) coordinateKitSummons(action, { body: kitBody, combatant, kitEffectState, party, random });
  for (const oreHit of landedOreHits) strikeOre(kitBody, oreHit);
  // A normal attack's first hit lands in the attack's seconds or, past them, from the summon its end queued it on
  const landedFirstHits = new Set([...stepHits, ...summonStrikes.map(({ hit }) => hit)]);
  for (const normalAttack of kit.normalAttacks) {
    const [firstHit] = normalAttack.hits;
    if (firstHit && landedFirstHits.has(firstHit))
      emit({ action: normalAttack, kind: KitEventKind.NormalAttackLanded });
  }
  // The summons' hits land from their own bodies, priced by the combatants that cast them and infused by their infusions,
  // And the step's own hits from the turned body and the character on the field
  const strikes: KitStrike[] = [
    ...summonStrikes.map((strike) => infuseKitStrike(strike, kitEffectState.effects)),
    ...landedHits.map((hit, index): KitStrike => ({ attackTag: attackTags[index], body: kitBody, combatant, hit })),
  ];
  landedHits.length = 0;
  gainKitAttackEnergy(kitState, strikeKitEnemies(strikes, strikeContext), party, random);
  // The changes to the members' HP since the last step are sent last, so the step's own heals and drains are heard in it,
  // And a change a kit makes as it hears one is sent at the next step
  const { healthChanges } = party;
  party.healthChanges = [];
  for (const healthChange of healthChanges) emit({ ...healthChange, kind: KitEventKind.HealthChanged });
};
