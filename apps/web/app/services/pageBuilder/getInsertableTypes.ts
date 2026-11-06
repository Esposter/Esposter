import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getAcceptedTypes } from "vue-block-editor-headless";

// The types, of those given, an insert at the insertion point lands. Each type resolves its target the way an insert does,
// And a type is kept only when the slot it lands in accepts it, so an insertion menu offers nothing an insert would refuse
export const getInsertableTypes: PageBuilderHelper<
  string[],
  [nodePointer: string | undefined, types: readonly string[]]
> = (kind, document, nodePointer, types) =>
  types.filter((type) => {
    const target = getInsertTarget(kind, document, type, nodePointer);
    return (
      target !== undefined &&
      getAcceptedTypes(document, kind.registry, kind.children, target.slotPointer).includes(type)
    );
  });
