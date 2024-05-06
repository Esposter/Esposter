import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import type { ListenersMap } from "@/lib/phaser/models/lifecycle/ListenersMap";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const useSceneStore = defineStore("phaser/scene", () => {
  const lifeCycleListenersMap = ref(
    Object.values(Lifecycle).reduce(
      (acc, curr) => {
        acc[curr] = Object.values(SceneKey).reduce((acc, curr) => {
          acc[curr] = [];
          return acc;
        }, {} as ListenersMap);
        return acc;
      },
      {} as Record<Lifecycle, ListenersMap>,
    ),
  );
  return { lifeCycleListenersMap };
});
