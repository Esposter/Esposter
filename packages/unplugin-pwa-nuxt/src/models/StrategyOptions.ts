import type { PwaContext } from "#src/models/PwaContext";

export type StrategyOptions =
  | NonNullable<PwaContext["resolvedOptions"]["buildSW"]>
  | NonNullable<PwaContext["resolvedOptions"]["generateSW"]>
  | NonNullable<PwaContext["resolvedOptions"]["injectManifest"]>;
