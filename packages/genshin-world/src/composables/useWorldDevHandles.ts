import type { WorldDevHandleOptions } from "#src/models/world/WorldDevHandleOptions";

import { createHealCommand } from "#src/services/dev/commands/createHealCommand";
import { createHoldCommand } from "#src/services/dev/commands/createHoldCommand";
import { createKillsCommand } from "#src/services/dev/commands/createKillsCommand";
import { createScreenCommand } from "#src/services/dev/commands/createScreenCommand";
import { createStateCommand } from "#src/services/dev/commands/createStateCommand";
import { createTeleportCommand } from "#src/services/dev/commands/createTeleportCommand";
import { createTimeCommand } from "#src/services/dev/commands/createTimeCommand";
import { createTimescaleCommand } from "#src/services/dev/commands/createTimescaleCommand";
import { DEV_SCENARIOS } from "#src/services/dev/scenarios/constants";

// The world's developer commands, joined to the registry by the session that holds the state they read and change: they
// Register once it mounts and leave when it goes, so each command exists exactly while the state it changes does. The
// Session steps the holds once a frame, after the frame has read the input, and returns that step
export const useWorldDevHandles = ({ devRegistry, inputTarget, ...options }: WorldDevHandleOptions) => {
  let unregister: (() => void) | undefined;
  const frameListeners = new Set<(deltaSeconds: number) => void>();

  onMounted(() => {
    if (!devRegistry) return;

    unregister = devRegistry.register({
      commands: [
        createHealCommand(options),
        createHoldCommand({
          onFrame: (listener) => {
            frameListeners.add(listener);
          },
          target: inputTarget,
        }),
        createKillsCommand(options),
        createScreenCommand(options),
        createStateCommand(options),
        createTeleportCommand(options),
        createTimeCommand(options),
        createTimescaleCommand(options),
      ],
      scenarios: DEV_SCENARIOS,
      variables: [],
    });
  });

  onUnmounted(() => {
    unregister?.();
  });

  return {
    stepHolds: (deltaSeconds: number) => {
      for (const listener of frameListeners) listener(deltaSeconds);
    },
  };
};
