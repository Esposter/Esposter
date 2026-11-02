import type { WorldEventMap } from "#src/models/world/WorldEventMap";
import type { WorldEvents } from "#src/models/world/WorldEvents";

// A listener runs synchronously, in the order it was registered, so an emit reads as the call it replaces
export const createWorldEvents = (): WorldEvents => {
  const listenerMap: { [K in keyof WorldEventMap]: ((...payload: WorldEventMap[K]) => void)[] } = {
    achievementEvents: [],
    bagChange: [],
    campCleared: [],
    chestOpened: [],
    defeatEnemy: [],
    domainEntryUnlocked: [],
    enterCombat: [],
    finishQuest: [],
    gatheringPickedUp: [],
    leaveCombat: [],
    oculusFound: [],
    parentQuestFinish: [],
    partyHealthChanged: [],
    pickUpMora: [],
    questEvent: [],
    reactionTriggered: [],
    shieldBreak: [],
    teleport: [],
    tipShown: [],
    worldLevelUp: [],
  };
  return {
    // Forgets every listener, so an emitter that outlives a session starts the next one with none
    clear: () => {
      for (const listeners of Object.values(listenerMap)) listeners.length = 0;
    },
    emit: (eventName, ...payload) => {
      for (const listener of listenerMap[eventName]) listener(...payload);
    },
    on: (eventName, listener) => {
      listenerMap[eventName].push(listener);
    },
  };
};
