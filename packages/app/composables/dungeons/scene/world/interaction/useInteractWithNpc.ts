import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { getOppositeDirection } from "@/services/dungeons/direction/getOppositeDirection";
import { applyNpcEffects } from "@/services/dungeons/scene/world/applyNpcEffects";
import { usePlayerStore } from "@/store/dungeons/player";
import { useNpcStore } from "@/store/dungeons/world/npc";

export const useInteractWithNpc = async (scene: SceneWithPlugins): Promise<boolean> => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);
  const npc = useGetInteractiveObject(npcList.value.map((npc) => ({ ...npc, ...npc.path[npc.pathIndex] })));
  if (!npc) return false;

  scene.gridEngine.turnTowards(npc.id, getOppositeDirection(player.value.direction));
  await applyNpcEffects(scene, npc);
  return true;
};
