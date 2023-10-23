import CrossedSwords from "@/assets/dungeons/icons/CrossedSwords.vue";
import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";
import Load from "@/assets/dungeons/icons/Load.vue";
import { toKebabCase } from "@/util/text";

const ComponentMap: Record<string, Component> = {
  CrossedSwords,
  DungeonGate,
  Load,
};

export const IconComponentMap = Object.entries(ComponentMap).reduce<Record<string, Component>>(
  (acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  },
  {},
);
