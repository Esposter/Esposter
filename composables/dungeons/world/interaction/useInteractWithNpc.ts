import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getOppositeDirection } from "@/services/dungeons/direction/getOppositeDirection";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useNpcStore } from "@/store/dungeons/world/npc";

export const useInteractWithNpc = async (scene: SceneWithPlugins): Promise<boolean> => {
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
  for (const effect of npc.effects)
    if (effect.type === EffectType.Message)
      await showMessages(
        scene,
        effect.messages.map((text) => ({ title: npc.name, text })),
      );

  return true;
};
