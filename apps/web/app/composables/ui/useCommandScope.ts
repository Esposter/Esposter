import type { UiCommandScope } from "#src/models/ui/UiCommandScope";

import { useCommandStore } from "#src/store/ui/command";

// Makes a surface's search the palette's scope for as long as the calling component is mounted, so the palette opens
// Searching it and Backspace on an empty query steps out to the whole app
export const useCommandScope = (scope: UiCommandScope) => {
  const commandStore = useCommandStore();
  const { registerScope } = commandStore;
  onScopeDispose(registerScope(scope));
};
