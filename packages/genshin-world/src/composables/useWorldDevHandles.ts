import type { WorldDevHandleOptions } from "#src/models/world/WorldDevHandleOptions";

import { createHealCommand } from "#src/services/dev/commands/createHealCommand";
import { createStateCommand } from "#src/services/dev/commands/createStateCommand";
import { createTeleportCommand } from "#src/services/dev/commands/createTeleportCommand";
import { createTimeCommand } from "#src/services/dev/commands/createTimeCommand";
import { createTimescaleCommand } from "#src/services/dev/commands/createTimescaleCommand";
import { DEV_SCENARIOS } from "#src/services/dev/scenarios/constants";

// The world's developer commands, joined to the registry by the session that holds the state they read and change: they
// Register once it mounts and leave when it goes, so each command exists exactly while the state it changes does
export const useWorldDevHandles = ({ devRegistry, ...options }: WorldDevHandleOptions) => {
  let unregister: (() => void) | undefined;

  onMounted(() => {
    if (!devRegistry) return;

    unregister = devRegistry.register({
      commands: [
        createHealCommand(options),
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
};
