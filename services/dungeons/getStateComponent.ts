import type { State } from "@/models/dungeons/State";

const StateComponentFilepathEntries = Object.entries<Component>(
  import.meta.glob("@/components/Dungeons/State/**.vue", { eager: true, import: "default" }),
);

export const getStateComponent = (state: State) => {
  let editFormComponent: Component | null = null;

  for (const [filepath, component] of StateComponentFilepathEntries)
    if (filepath.includes(state)) editFormComponent = component;

  return editFormComponent;
};
