import type { DevHandle } from "#src/models/dev/DevHandle";
import type { DevRegistry } from "#src/models/dev/DevRegistry";

import { onMounted, onUnmounted } from "vue";

// Registers the handle `createHandle` builds with the development registry while its owner is mounted, and removes it when
// The owner unmounts. The handle is taken through a promise, so one built over a wait on the world and one built at once
// Share this path, and a handle still being built when the owner unmounts is never registered
export const useDevRegistration = ({
  createHandle,
  devRegistry,
}: {
  createHandle: () => DevHandle | Promise<DevHandle>;
  devRegistry: DevRegistry | undefined;
}) => {
  let isActive = true;
  let unregister: (() => void) | undefined;

  onMounted(() => {
    if (!devRegistry) return;

    void Promise.resolve(createHandle()).then((handle) => {
      if (isActive) unregister = devRegistry.register(handle);
    });
  });
  onUnmounted(() => {
    isActive = false;
    unregister?.();
  });
};
