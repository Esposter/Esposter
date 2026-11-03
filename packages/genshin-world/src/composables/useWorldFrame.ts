import type { WorldFrameOptions } from "#src/models/world/WorldFrameOptions";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { EnemyKindMovesMap } from "#src/services/bosses/EnemyKindMovesMap";
import { startBossMove } from "#src/services/bosses/startBossMove";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { PARTY_MEMBER_BURST_INPUT_ACTIONS, PARTY_MEMBER_INPUT_ACTIONS } from "#src/services/party/constants";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { checkIsSpecialStoryModeActive } from "#src/services/quest/checkIsSpecialStoryModeActive";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { OCULUS_REGION_ID } from "#src/services/statue/constants";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { useWorldMapStore } from "#src/store/map";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { InputAction } from "genshin-engine";
import { InteractionKind } from "genshin-interface";
import { storeToRefs } from "pinia";

// The world's frame, run before each draw: the input is read, the screen it moves to is chosen, and each feature that
// Moves on its own steps by the time that passed, in the order they depend on one another. The world's own steps run
// Only while it is in play, the challenges decide that for themselves, and the interaction the player is prompted on is
// Dispatched last, as it may open a screen
export const useWorldFrame = ({
  abyssChoices,
  characterBody,
  checkIsPaused,
  closeShortcutWheel,
  collectOculus,
  dispatchInteraction,
  domainClaimOffers,
  drawDayOutcrops,
  elementalSight,
  findTouchedOculus,
  getEquippedGadgetCooldown,
  getMemberMaxHealth,
  hudFrame,
  input,
  inputState,
  interactionPrompts,
  isHudHidden,
  kitContext,
  party,
  placeUsedGadget,
  readInteraction,
  refreshMiningOutcrops,
  showCursor,
  stepAbyss,
  stepAutoRecover,
  stepDomainChallenge,
  stepFishing,
  stepMenuNavigation,
  stepQuickUse,
  stepShortcutWheel,
  stepTrial,
  touchOutcropsNear,
}: WorldFrameOptions) => {
  const worldPuzzlesStore = useWorldPuzzlesStore();
  const { stepWorldPuzzles } = worldPuzzlesStore;
  const worldScreenStore = useWorldScreenStore();
  const { screenKind } = storeToRefs(worldScreenStore);
  const worldMapStore = useWorldMapStore();
  const { unlockedLandmarkIds } = storeToRefs(worldMapStore);
  const { jumpTo } = worldMapStore;
  const worldQuestsStore = useWorldQuestsStore();
  const { questProgressMap, questsInProgress, trackedQuestId, trackerQuest } = storeToRefs(worldQuestsStore);
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow } = worldSessionStore;
  // Whether the world is in play: not paused and on the world's own screen, which a step changes as the frame goes on
  const checkIsWorldInPlay = () => !checkIsPaused() && screenKind.value === ScreenKind.World;
  // Each attack a phase's end names starts on whichever boss makes it, and a name no boss makes starts nothing
  const startBossMoves = (attacks: readonly string[]) => {
    for (const attack of attacks)
      for (const enemy of kitContext.enemyMap.values())
        startBossMove(
          enemy,
          checkIsEnemyKindId(enemy.enemyKindId) ? (EnemyKindMovesMap[enemy.enemyKindId] ?? []) : [],
          attack,
        );
  };
  // The player's reach in the world: the Oculus the body touches is collected, the statue in reach restores the party,
  // And the interactable the prompts select is acted on
  const stepInteraction = (deltaMilliseconds: number) => {
    const interactable = readInteraction(inputState, deltaMilliseconds);
    const touchedOculus = findTouchedOculus();
    if (touchedOculus) collectOculus(OCULUS_REGION_ID, touchedOculus);
    const isNearStatue = interactionPrompts.value.interactables.some(
      ({ id, kind }) =>
        kind === InteractionKind.Activate && unlockedLandmarkIds.value.has(id) && getStatueRegionId(id) !== undefined,
    );
    stepAutoRecover({ deltaMilliseconds, getMaxHealth: getMemberMaxHealth, isNearStatue, party });
    dispatchInteraction(interactable);
  };
  const stepFrame = ({ delta, elapsed }: { delta: number; elapsed: number }) => {
    input.readInput(delta);
    hudFrame.seconds = elapsed;
    if (!checkIsPaused())
      screenKind.value = getNextScreenKind(screenKind.value, inputState.pressedActions, {
        isPaimonMenuLocked: checkIsSpecialStoryModeActive(questsInProgress.value, questProgressMap.value),
      });
    stepMenuNavigation(delta);
    if (checkIsWorldInPlay())
      stepShortcutWheel(
        inputState.heldActions.has(InputAction.OpenShortcutWheel),
        inputState.moveRight,
        -inputState.moveForward,
      );
    else if (screenKind.value !== ScreenKind.World) closeShortcutWheel();
    if (checkIsWorldInPlay() && inputState.pressedActions.has(InputAction.HideInterface))
      isHudHidden.value = !isHudHidden.value;
    if (checkIsWorldInPlay())
      stepElementalSight(
        elementalSight,
        characterBody.position,
        delta,
        inputState.pressedActions.has(InputAction.ElementalSight),
      );
    else elementalSight.isOn = false;
    if (checkIsWorldInPlay()) stepWorldPuzzles(delta, characterBody.position);
    if (checkIsWorldInPlay()) drawDayOutcrops(getWorldNow(), kitContext.random);
    const transitionAttacks = stepDomainChallenge({
      deltaMilliseconds: delta,
      isPartyDown: false,
      isPlaying: checkIsWorldInPlay() && domainClaimOffers.value === undefined,
    });
    const trialReturnPose = stepTrial({
      deltaMilliseconds: delta,
      isPartyDown: false,
      isPlaying: checkIsWorldInPlay(),
    });
    if (trialReturnPose) jumpTo(trialReturnPose);
    stepAbyss({
      deltaMilliseconds: delta,
      isPartyDown: false,
      isPlaying: checkIsWorldInPlay() && abyssChoices.value === undefined,
    });
    if (checkIsWorldInPlay()) refreshMiningOutcrops(getWorldNow(), kitContext.random);
    startBossMoves(transitionAttacks);
    if (checkIsWorldInPlay()) touchOutcropsNear(characterBody.position.x, characterBody.position.z, kitContext.random);
    if (!checkIsPaused() && screenKind.value === ScreenKind.Fishing)
      stepFishing({
        isReeling: inputState.heldActions.has(InputAction.NormalAttack),
        isStruck: inputState.pressedActions.has(InputAction.NormalAttack),
        seconds: delta,
      });
    if (inputState.pressedActions.has(InputAction.ShowCursor)) showCursor();
    const usedGadget = stepQuickUse({
      isActive: checkIsWorldInPlay(),
      isHeld:
        inputState.heldActions.has(InputAction.QuickUseGadget) ||
        inputState.pressedActions.has(InputAction.QuickUseGadget),
      now: getWorldNow(),
      seconds: delta,
    });
    placeUsedGadget(usedGadget, characterBody.position);
    hudFrame.gadgetCooldown = getEquippedGadgetCooldown(getWorldNow());
    // A switch with a burst switches as a plain one does, so its member is on the field when the kit reads the burst
    const partyMemberIndex = PARTY_MEMBER_INPUT_ACTIONS.findIndex(
      (action, index) =>
        inputState.pressedActions.has(action) ||
        inputState.pressedActions.has(PARTY_MEMBER_BURST_INPUT_ACTIONS[index] ?? action),
    );
    if (checkIsWorldInPlay() && partyMemberIndex !== -1)
      switchPartyMember(party, partyMemberIndex, elapsed, kitContext.kitEffectState.effects);
    if (checkIsWorldInPlay() && trackerQuest.value && inputState.pressedActions.has(InputAction.QuestNavigation))
      trackedQuestId.value = trackerQuest.value.id;
    if (checkIsWorldInPlay()) stepInteraction(delta);
  };
  return { stepFrame };
};
