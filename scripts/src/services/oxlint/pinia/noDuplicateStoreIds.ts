import type { Rule } from "@oxlint/plugins";

import { checkIsDefineStore } from "#src/services/oxlint/pinia/checkIsDefineStore";
import { buildDuplicateStoreIdMessage } from "#src/services/oxlint/pinia/constants";
import { getStoreId } from "#src/services/oxlint/pinia/getStoreId";
import { defineRule } from "@oxlint/plugins";

// The store ids each file defines, by file. Pinia keys every store by its id across the whole app, so each file is
// Checked against the others read before it
const storeIdsByFilename = new Map<string, Set<string>>();

export const noDuplicateStoreIds: Rule = defineRule({
  create(context) {
    const { filename } = context;
    // A file linted again starts from its own ids, not the ones it defined the last time it was read
    const fileStoreIds = new Set<string>();
    storeIdsByFilename.set(filename, fileStoreIds);
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

        for (const [otherFilename, otherStoreIds] of storeIdsByFilename)
          if (otherFilename !== filename && otherStoreIds.has(storeId)) {
            context.report({ message: buildDuplicateStoreIdMessage(storeId), node: storeIdArgument });
            return;
          }
      },
    };
  },
  meta: { type: "problem" },
});
