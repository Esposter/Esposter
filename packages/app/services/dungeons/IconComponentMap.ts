import Anime from "@/assets/anime/icons/Anime.vue";
import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";
import { toKebabCase } from "@/util/text/toKebabCase";

const ComponentMap: Record<string, Component> = {
  Anime,
  DungeonGate,
};

export const IconComponentMap = Object.entries(ComponentMap).reduce<Record<string, Component>>(
  (acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  },
  {},
);
