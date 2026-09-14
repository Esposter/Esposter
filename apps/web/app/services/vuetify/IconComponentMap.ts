import Anime from "@/assets/anime/icons/Anime.vue";
import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";

// The `custom:` set the vuetify plugin registers. A key is the name after the prefix, so `icon: "custom:dungeon-gate"`
// Resolves here — written out rather than derived from the component names, which left the names nothing greps for
export const IconComponentMap: Record<string, Component> = {
  anime: Anime,
  "dungeon-gate": DungeonGate,
};
