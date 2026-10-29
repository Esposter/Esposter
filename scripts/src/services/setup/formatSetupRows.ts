import type { SetupRow } from "#src/models/setup/SetupRow";

import { formatFleetTable } from "#src/services/fleet/formatFleetTable";

// The setup table, aligned as the resume table is: the step, its status and the command or link that closes it
export const formatSetupRows = (rows: readonly SetupRow[]): string[] =>
  formatFleetTable(
    ["step", "status", "next"],
    rows.map(({ next, status, step }) => [step, status, next]),
  );
