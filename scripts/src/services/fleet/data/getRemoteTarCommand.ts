import type { TarOperation } from "#src/models/fleet/data/TarOperation";

import { getTarArguments } from "#src/services/fleet/data/getTarArguments";
import { toRemotePath } from "#src/services/fleet/data/toRemotePath";

// The remote tar command, its paths quoted for the peer's shell
export const getRemoteTarCommand = (operation: TarOperation, directory: string): string =>
  ["tar", ...getTarArguments(operation, toRemotePath(directory))].join(" ");
