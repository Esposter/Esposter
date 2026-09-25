import type { SceneWithPlugins } from "vue-phaserjs";

import { getOppositeDirection } from "@/services/dungeons/direction/getOppositeDirection";
import { applyNpcEffects } from "@/services/dungeons/scene/world/applyNpcEffects";
import { usePlayerStore } from "@/store/dungeons/player";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { takeOne } from "@esposter/shared";

export const useInteractWithNpc = async (scene: SceneWithPlugins): Promise<boolean> => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { items } = storeToRefs(npcStore);
  // An NPC stands where its patrol has it, read off its path rather than written onto it — its path and index are
  // The only position an NPC holds
  const npc = items.value.find((npcItem) => useInteractiveObject([takeOne(npcItem.path, npcItem.pathIndex)]));
  if (!npc) return false;

  scene.gridEngine.turnTowards(npc.id, getOppositeDirection(player.value.direction));
  await applyNpcEffects(scene, npc);
  return true;
};
