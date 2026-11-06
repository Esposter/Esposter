import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { FIRST_IN_SLOT_MESSAGE, LAST_IN_SLOT_MESSAGE } from "@/services/pageBuilder/constants";
import { getSiblingMoveOperations } from "headless-block-editor";

// Why a node cannot move one place along its slot, or none when it can. The same operations decide it, so the reason can
// Only be given for a move that does not land: a move up past the first node is refused as the first, and down as the last
export const getSiblingMoveRefusal: PageBuilderHelper<string | undefined, [nodePointer: string, offset: number]> = (
  kind,
  document,
  nodePointer,
  offset,
) => {
  if (getSiblingMoveOperations(document, kind.registry, kind.children, nodePointer, offset).length > 0)
    return undefined;

  return offset < 0 ? FIRST_IN_SLOT_MESSAGE : LAST_IN_SLOT_MESSAGE;
};
