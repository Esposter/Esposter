import type { PwaContext } from "#src/models/PwaContext";

type ResolvedOptions = PwaContext["resolvedOptions"];
type StrategyOptions =
  | NonNullable<ResolvedOptions["buildSW"]>
  | NonNullable<ResolvedOptions["generateSW"]>
  | NonNullable<ResolvedOptions["injectManifest"]>;

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
