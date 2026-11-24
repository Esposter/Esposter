import type { Rule } from "@oxlint/plugins";

import { checkIsDefineStore } from "#src/services/oxlint/pinia/checkIsDefineStore";
import { buildDuplicateStoreIdMessage } from "#src/services/oxlint/pinia/constants";
import { getStoreId } from "#src/services/oxlint/pinia/getStoreId";
import { getOrCreate } from "@esposter/shared";
import { defineRule } from "@oxlint/plugins";

// The files that define each store id, and the ids each file defines. Pinia keys every store by its id across the whole
// App, so each id is checked against the files read before it, by one lookup rather than a walk over every file
const storeIdFilenamesMap = new Map<string, Set<string>>();
const filenameStoreIdsMap = new Map<string, Set<string>>();

export const noDuplicateStoreIds: Rule = defineRule({
  create(context) {
    const { filename } = context;
    // A file linted again starts from its own ids, not the ones it defined the last time it was read
    for (const storeId of filenameStoreIdsMap.get(filename) ?? []) storeIdFilenamesMap.get(storeId)?.delete(filename);
    const fileStoreIds = new Set<string>();
    filenameStoreIdsMap.set(filename, fileStoreIds);
    return {
      CallExpression(node) {
        if (!checkIsDefineStore(node)) return;

        const storeId = getStoreId(node);
        const [storeIdArgument] = node.arguments;
        if (storeId === undefined || storeIdArgument === undefined) return;

        if (fileStoreIds.has(storeId)) {
          context.report({ message: buildDuplicateStoreIdMessage(storeId), node: storeIdArgument });
          return;
        }
        fileStoreIds.add(storeId);
        const storeIdFilenames = getOrCreate(storeIdFilenamesMap, storeId, () => new Set<string>());
        const isDefinedElsewhere = storeIdFilenames.size > 0;
        storeIdFilenames.add(filename);
        if (isDefinedElsewhere)
          context.report({ message: buildDuplicateStoreIdMessage(storeId), node: storeIdArgument });
      },
    };
  },
  meta: { type: "problem" },
});
