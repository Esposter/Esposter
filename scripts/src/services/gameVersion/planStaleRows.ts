import type { StalePlanSection } from "#src/models/gameVersion/StalePlanSection";
import type { StaleRow } from "#src/models/gameVersion/StaleRow";

import { GAME_VERSION_COMMAND_KINDS, UNLISTED_COMMAND_HEADING } from "#src/services/gameVersion/constants";
import { findCommandHeading } from "#src/services/gameVersion/findCommandHeading";

// The stale commands in the order an update runs them, each once under the heading of its kind, the commands no kind
// Lists last
export const planStaleRows = (rows: readonly StaleRow[]): StalePlanSection[] => {
  const headings = [...GAME_VERSION_COMMAND_KINDS.map(({ heading }) => heading), UNLISTED_COMMAND_HEADING];
  const commands = rows.map(({ command }) => command);
  return headings
    .map((heading) => ({
      commands: commands.filter((command) => findCommandHeading(command) === heading).toSorted(),
      heading,
    }))
    .filter(({ commands: sectionCommands }) => sectionCommands.length > 0);
};
