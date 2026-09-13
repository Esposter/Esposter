import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { getNulSeparatedTokens } from "#src/services/shared/getNulSeparatedTokens";

// The one reading of the listing, so every classifier asks it for the path a row ends at and the one it came from
// Rather than re-parsing the rows for the field it wants.
//
// The listing is read with `-z`. Without it git prints one row per newline with tab-separated fields and quotes a
// Path holding a tab, a newline or a non-ASCII byte in C-style escapes instead of the literal bytes, so a
// Tab-splitting regex reads the quote marks and escape sequences as part of the path. `-z` NUL-terminates every
// Field instead, one flat token stream with no quoting to undo: a rename row is three tokens (status, the path it
// Came from, the path it ends at), every other status two (status, path).
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
