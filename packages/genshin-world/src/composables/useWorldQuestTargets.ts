import type { QuestMark } from "#src/models/quest/QuestMark";
import type { WorldQuestTargetsOptions } from "#src/models/quest/WorldQuestTargetsOptions";

import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { getEnteredGoToEvents } from "#src/services/quest/getEnteredGoToEvents";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { computed, watch } from "vue";

// Where the quests' targets stand from the character: each go-to place the character steps into is a go-to event, and
// The quests' distances and the navigated objective's mark are read off the regions in reach
export const useWorldQuestTargets = ({
  events,
  getGroundHeight,
  mapCamera,
  questProgressMap,
  questsInProgress,
  questTargetId,
  windrise,
}: WorldQuestTargetsOptions) => {
  // A quest's go-to step is reached once the character steps into its place's radius, so each place it steps into is a go-to
  watch(mapCamera, (newCamera, oldCamera) => {
    if (!windrise.value) return;
    for (const questEvent of getEnteredGoToEvents([...windrise.value.regionDataMap.values()], oldCamera, newCamera))
      events.emit("questEvent", questEvent);
  });
  // How far each quest in progress's objective stands from the character's ground point, in metres, which the quest
  // Screen lists. It is read only while that screen is drawn, and a quest whose target no region in reach places has none
  const questDistanceMap = computed(() => {
    const distanceMap = new Map<string, number>();
    if (!windrise.value) return distanceMap;
    const { regionDataMap, residentSpots } = windrise.value;
    const { x, z } = mapCamera.value;
    for (const quest of questsInProgress.value) {
      const targetId = getQuestTargetId(quest, questProgressMap.value.get(quest.id));
      const position = targetId ? findQuestTargetPosition(regionDataMap, residentSpots, targetId) : undefined;
      if (position) distanceMap.set(quest.id, Math.hypot(position.x - x, position.z - z));
    }
    return distanceMap;
  });
  // Where the navigated objective stands from the character, which the tracker's line under its title reads: its distance
  // Across the ground, as the quest screen lists it, and its ground's height over the character's ground point, both read
  // Off the world's one ground. None while no quest is navigated to or no region in reach places its objective
  const questMark = computed<QuestMark | undefined>(() => {
    if (!windrise.value || !questTargetId.value) return undefined;
    const { regionDataMap, residentSpots } = windrise.value;
    const position = findQuestTargetPosition(regionDataMap, residentSpots, questTargetId.value);
    if (!position) return undefined;
    const { x, z } = mapCamera.value;
    return {
      distance: Math.hypot(position.x - x, position.z - z),
      height: getGroundHeight(position.x, position.z) - getGroundHeight(x, z),
    };
  });
  return { questDistanceMap, questMark };
};
