import type { SceneWithPlugins } from "vue-phaserjs";

import { getOppositeDirection } from "#src/services/dungeons/direction/getOppositeDirection";
import { applyNpcEffects } from "#src/services/dungeons/scene/world/applyNpcEffects";
import { getInteractiveObject } from "#src/services/dungeons/scene/world/interaction/getInteractiveObject";
import { usePlayerStore } from "#src/store/dungeons/player";
import { useNpcStore } from "#src/store/dungeons/world/npc";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { noop, takeOne } from "@esposter/shared";

export const interactWithNpc = async (scene: SceneWithPlugins) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { items } = storeToRefs(npcStore);
  const worldSceneStore = useWorldSceneStore();
  const { gridEngine } = storeToRefs(worldSceneStore);
  // An NPC stands where its patrol has it, read off its path rather than written onto it — its path and index are
  // The only position an NPC holds
  const npc = items.value.find((npcItem) => getInteractiveObject([takeOne(npcItem.path, npcItem.pathIndex)]));
  if (!npc) return false;

  gridEngine.value?.turnTowards(npc.id, getOppositeDirection(player.value.direction)).match(noop, console.error);
  await applyNpcEffects(scene, npc);
  return true;
};
