import type { Party } from "#src/models/party/Party";
import type { AutoRecoverDwell } from "#src/models/statue/AutoRecoverDwell";
import type { AutoRecoverSetting } from "#src/models/statue/AutoRecoverSetting";
import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { TRAVELER_BONUS_QUEST_ID } from "#src/services/character/constants";
import { advanceAutoRecoverDwell } from "#src/services/statue/advanceAutoRecoverDwell";
import { autoRecoverParty } from "#src/services/statue/autoRecoverParty";
import { computeTravelerElement } from "#src/services/statue/computeTravelerElement";
import {
  AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT,
  AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
  RESTORATIVE_POWER_PER_STATUE,
} from "#src/services/statue/constants";
import { getResonatedRegionIds } from "#src/services/statue/getResonatedRegionIds";
import { getTravelerElementBonusLines } from "#src/services/statue/getTravelerElementBonusLines";
import { regenerateRestorativePower } from "#src/services/statue/regenerateRestorativePower";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

export const useWorldRestorativePower = ({ unlockedLandmarkIds }: { unlockedLandmarkIds: ReadonlySet<string> }) => {
  const worldQuestsStore = useWorldQuestsStore();
  const { finishedMainQuestIds } = storeToRefs(worldQuestsStore);
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow } = worldSessionStore;
  // The regions whose statues the Traveler resonated with, which give its element and, once Welkin Moon's Homecoming is
  // Done, its bonuses. The unlocked landmarks, which hold the resonances, set them again as they change, below the map
  const resonatedRegionIds = shallowRef(getResonatedRegionIds(unlockedLandmarkIds));
  // The Restorative Power the Statue's Blessing holds, full to the statues resonated with.
  // The save holds no pool, so it is kept for the session
  const restorativePower = shallowRef<RestorativePower>({
    amount: RESTORATIVE_POWER_PER_STATUE * resonatedRegionIds.value.length,
    changedAt: getWorldNow(),
  });
  // Auto-recover as the Blessing sets it, off at its starting threshold, and the stand by a statue's base it runs
  // After its Dwell. Kept for the session as the pool is, since the save holds neither
  const autoRecoverSetting = shallowRef<AutoRecoverSetting>({
    isOn: false,
    thresholdPercent: AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT,
  });
  let autoRecoverDwell: AutoRecoverDwell = { isRecovered: false, seconds: 0 };
  const travelerElement = computed(() => computeTravelerElement(resonatedRegionIds.value));
  const travelerBonusLines = computed(() =>
    getTravelerElementBonusLines(resonatedRegionIds.value, finishedMainQuestIds.value.has(TRAVELER_BONUS_QUEST_ID)),
  );
  // Auto-recover runs once a stand by a statue's base reaches its dwell, with the switch on
  const stepAutoRecover = ({
    deltaSeconds,
    getMaxHealth,
    isNearStatue,
    party,
  }: {
    deltaSeconds: number;
    getMaxHealth: (characterId: number) => number | undefined;
    isNearStatue: boolean;
    party: Party;
  }) => {
    const autoRecoverStep = advanceAutoRecoverDwell(
      autoRecoverDwell,
      isNearStatue && autoRecoverSetting.value.isOn,
      deltaSeconds,
    );
    autoRecoverDwell = autoRecoverStep.dwell;
    if (autoRecoverStep.isDue)
      restorativePower.value = autoRecoverParty(
        party,
        regenerateRestorativePower(restorativePower.value, resonatedRegionIds.value.length, getWorldNow()),
        autoRecoverSetting.value.thresholdPercent / AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
        (characterId) => getMaxHealth(characterId) ?? 0,
      );
  };
  return {
    autoRecoverSetting,
    resonatedRegionIds,
    restorativePower,
    stepAutoRecover,
    travelerBonusLines,
    travelerElement,
  };
};
