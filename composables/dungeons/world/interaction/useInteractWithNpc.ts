import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { getOppositeDirection } from "@/services/dungeons/getOppositeDirection";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useNpcStore } from "@/store/dungeons/world/npc";

export const useInteractWithNpc = (): boolean => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
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

  scene.value.gridEngine.turnTowards(npc.id, getOppositeDirection(player.value.direction));
  showMessages(npc.messages.map((text) => ({ title: npc.name, text })));
  return true;
};
