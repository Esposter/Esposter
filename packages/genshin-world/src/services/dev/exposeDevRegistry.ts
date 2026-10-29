import type { DevRegistry } from "#src/models/dev/DevRegistry";

// Puts the registry's line runner on the target as `__dev.run`, the one call an automation makes, so the target (a window a
// Script drives in a browser) is handed in rather than read here
export const exposeDevRegistry = (registry: DevRegistry, target: object): void => {
  Object.assign(target, { __dev: { run: registry.run } });
};
