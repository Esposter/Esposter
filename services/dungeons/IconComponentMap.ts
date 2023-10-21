import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";
import Load from "@/assets/dungeons/icons/Load.vue";
import { toKebabCase } from "@/util/text";

const ComponentMap: Record<string, Component> = {
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
