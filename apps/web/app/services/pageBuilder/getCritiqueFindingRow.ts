import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { UiListItem } from "@/models/ui/UiListItem";

import { getCritiqueFindingSummary } from "@/services/pageBuilder/getCritiqueFindingSummary";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { ID_SEPARATOR, parseJsonPointer } from "@esposter/shared";

// A finding as a row of the Check panel: the title of the node it names, what it found, and a value of the node's id
// Then the finding's kind, since one node can carry two findings. A node id holds no separator, so the panel reads the
// Node back from the value's first part
export const getCritiqueFindingRow = (document: WebpageDocument, finding: CritiqueFinding): UiListItem<string> => {
  const nodePointer = getNodePointer(webpageKind, document, finding.nodeId);
  const title = nodePointer === undefined ? "" : getNodeTitle(webpageKind, document, parseJsonPointer(nodePointer));
  return { ...getCritiqueFindingSummary(finding), title, value: `${finding.nodeId}${ID_SEPARATOR}${finding.kind}` };
};
