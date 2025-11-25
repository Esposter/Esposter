import Anime from "@/assets/anime/icons/Anime.vue";
import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";
import { toKebabCase } from "@esposter/shared";

const ComponentMap: Record<string, Component> = {
  Anime,
  DungeonGate,
};

export const IconComponentMap = Object.fromEntries(
  Object.entries(ComponentMap).map(([name, component]) => [toKebabCase(name), component]),
);
