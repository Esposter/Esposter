import type { ChestLockSource } from "#src/models/chest/ChestLockSource";

// The camps' locks as last emitted, by each camp's done flag in order, cleared on every load so the next step emits them
export const useEnemyCampLocks = (onCampLocks: (campLocks: ChestLockSource[]) => void) => {
  let emittedCampLocksKey = "";
  return {
    reset: () => {
      emittedCampLocksKey = "";
    },
    update: (campLocks: ChestLockSource[]) => {
      const campLocksKey = campLocks.map(({ isDone }) => (isDone ? "1" : "0")).join("");
      if (campLocksKey === emittedCampLocksKey) return;
      emittedCampLocksKey = campLocksKey;
      onCampLocks(campLocks);
    },
  };
};
