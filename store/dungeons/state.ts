import type { Transition } from "@/models/dungeons/transitions/Transition";
import { useGameStore } from "@/store/dungeons/game";

export const useStateStore = defineStore("dungeons/state", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const executeTransition = (transition: Transition) => {
    if (game.value.state !== transition.from) {
      console.error(`Could not execute action: ${transition.constructor.name}, Game state: ${game.value.state}`);
      return;
    }

    game.value.state = transition.to;
  };
  return { executeTransition };
});
