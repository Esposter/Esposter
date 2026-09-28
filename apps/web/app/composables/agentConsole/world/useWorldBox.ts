import type { WorldBox } from "@/models/agentConsole/world/WorldBox";

import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";

// What a component draws apart from the voxels collides as the voxels do: its box joins the world's for as long as the
// Component is mounted, follows it as it changes, and leaves while the component draws nothing
export const useWorldBox = (getBox: () => WorldBox | undefined) => {
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { objectBoxMap } = storeToRefs(agentConsoleWorldStore);
  const id = useId();
  watchImmediate(getBox, (box) => {
    if (box) objectBoxMap.value.set(id, box);
    else objectBoxMap.value.delete(id);
  });
  onScopeDispose(() => {
    objectBoxMap.value.delete(id);
  });
};
