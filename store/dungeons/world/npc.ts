import { type NPC } from "@/models/dungeons/world/NPC";

export const useNPCStore = defineStore("dungeons/world/npc", () => {
  const npcList = ref<NPC[]>([]);
  const pushNPCList = (npcs: NPC[]) => {
    npcList.value.push(...npcs);
  };
  return {
    npcList,
    pushNPCList,
  };
});
