import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

export const checkHasEntrypoint = ({ exports, main, module }: InstalledManifest): boolean =>
  exports !== undefined || main !== undefined || module !== undefined;
