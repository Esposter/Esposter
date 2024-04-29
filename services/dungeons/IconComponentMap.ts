import DungeonGate from "@/assets/dungeons/icons/DungeonGate.vue";
import { toKebabCase } from "@/util/text/toKebabCase";

const ComponentMap: Record<string, Component> = {
  DungeonGate,
};

export const IconComponentMap = new Map(
  Object.entries(ComponentMap).map(([name, component]) => [toKebabCase(name), component]),
);
