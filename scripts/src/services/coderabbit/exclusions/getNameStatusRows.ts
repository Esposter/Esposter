import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { getNulSeparatedTokens } from "#src/services/shared/getNulSeparatedTokens";

// Read with `-z`: without it git quotes a path holding a tab, a newline or a non-ASCII byte in C-style escapes.
// NUL-terminated, a rename row is three tokens (status, from, to) and every other status two.
export const getNameStatusRows = (nameStatus: string): NameStatusRow[] => {
  const tokens = getNulSeparatedTokens(nameStatus);
  const rows: NameStatusRow[] = [];
  let index = 0;
  while (index < tokens.length) {
    const status = tokens[index];
    const firstPath = tokens[index + 1];
    if (status === undefined || firstPath === undefined) break;
    else if (status.startsWith("R")) {
      const path = tokens[index + 2];
      if (path === undefined) break;
      rows.push({ path, renamedFrom: firstPath, status });
      index += 3;
    } else {
      rows.push({ path: firstPath, status });
      index += 2;
    }
  }
  return rows;
};
