import type { PwaContext } from "#src/models/PwaContext";
import type { StrategyOptions } from "#src/models/StrategyOptions";

// The options of the strategy in use, which the engine resolves for every strategy but the one that removes a worker
export const getStrategyOptions = ({ resolvedOptions, strategy }: PwaContext): StrategyOptions | undefined => {
  switch (strategy) {
    case "build-sw":
      return resolvedOptions.buildSW;
    case "generate-sw":
      return resolvedOptions.generateSW;
    case "inject-manifest":
      return resolvedOptions.injectManifest;
    default:
      return undefined;
  }
};
