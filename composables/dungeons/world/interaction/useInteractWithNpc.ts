import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { getOppositeDirection } from "@/services/dungeons/getOppositeDirection";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { usePlayerStore } from "@/store/dungeons/world/player";

export const useInteractWithNpc = (): boolean => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const playerStore = usePlayerStore();
  const { direction } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);
  const npc = useFindInteractiveObject(
    npcList.value.map(({ path, pathIndex, ...rest }) => ({ ...path[pathIndex], ...rest })),
  );
  if (!npc) return false;

  scene.value.gridEngine.turnTowards(npc.id, getOppositeDirection(direction.value));
  showMessages(npc.messages.map((text) => ({ title: npc.name, text })));
  return true;
};
