import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getOppositeDirection } from "@/services/dungeons/direction/getOppositeDirection";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useNpcStore } from "@/store/dungeons/world/npc";

export const useInteractWithNpc = (scene: SceneWithPlugins): boolean => {
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);
  const npc = useGetInteractiveObject(
    npcList.value.map(({ path, pathIndex, ...rest }) => ({ ...path[pathIndex], ...rest })),
  );
  if (!npc) return false;

  scene.gridEngine.turnTowards(npc.id, getOppositeDirection(player.value.direction));
  showMessages(
    scene,
    npc.messages.map((text) => ({ title: npc.name, text })),
  );
  return true;
};
