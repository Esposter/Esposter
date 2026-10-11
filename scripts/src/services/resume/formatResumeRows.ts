import type { ResumeRow } from "#src/models/resume/ResumeRow";

import { formatFleetTable } from "#src/services/fleet/formatFleetTable";

// One line per leftover under its check, which is named once. An action is written once for a run of items sharing it
export const formatResumeRows = (rows: readonly ResumeRow[]): string[] =>
  formatFleetTable(
    ["check", "state", "action"],
    rows.flatMap(({ error, items, name }) => {
      if (error !== "") return [[name, `error: ${error}`, ""]];
      if (items.length === 0) return [[name, "ok", ""]];
      return items.map(({ action, text }, index) => [
        index === 0 ? name : "",
        text,
        action === items[index - 1]?.action ? "" : action,
      ]);
    }),
  );
