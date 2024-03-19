import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useGameStore } from "@/store/dungeons/game";

export const Finished: State<StateName> = {
  name: StateName.Finished,
  onEnter: () => {
    const gameStore = useGameStore();
    const { fadeSwitchToScene } = gameStore;
    fadeSwitchToScene(SceneKey.World);
  },
};
