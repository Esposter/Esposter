import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { TablesOf } from "#src/models/shared/overlay/TablesOf";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { RowVersion } from "@esposter/db-schema";

import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { getHeaderRowKey } from "#src/services/shared/overlay/getHeaderRowKey";

// The rows of the given tables that a write's answer named, as the confirmations its entry waits for.
// A row of a table not given, or one whose scope leaves a key value out, confirms none.
export const createHeaderConfirmations = <TRows extends Versioned[]>(
  tables: TablesOf<TRows>,
  rowVersions: RowVersion[],
): Confirmation[] =>
  tables.flatMap((table) =>
    rowVersions.flatMap((rowVersion) => {
      const key = getHeaderRowKey(table, rowVersion);
      return key === undefined ? [] : [createConfirmation(table, key, rowVersion.version)];
    }),
  );
