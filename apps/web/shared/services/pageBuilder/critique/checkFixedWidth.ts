import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { STYLE_BREAKPOINT_ORDER } from "#shared/services/pageBuilder/constants";
import { NARROWEST_DEVICE_WIDTH } from "#shared/services/pageBuilder/critique/constants";
import { getLengthInPixels } from "#shared/services/pageBuilder/critique/getLengthInPixels";
import { getNodeStyle } from "#shared/services/pageBuilder/critique/getNodeStyle";

// The width a node takes at the phone is the one its narrowest override sets, since a tablet override applies at the phone's width too
export const checkFixedWidth = (node: WebpageNode): CritiqueFinding[] => {
  const style = getNodeStyle(node);
  const phoneWidth = STYLE_BREAKPOINT_ORDER.flatMap((breakpoint) => {
    const width = style?.[breakpoint]?.[StyleState.Default]?.width;
    return width ? [width] : [];
  }).at(-1);
  if (phoneWidth === undefined) return [];

  const phoneWidthInPixels = getLengthInPixels(phoneWidth);
  if (phoneWidthInPixels === undefined || phoneWidthInPixels <= NARROWEST_DEVICE_WIDTH) return [];

  return [{ kind: CritiqueFindingKind.WideFixedWidth, nodeId: node.props.id, phoneWidthInPixels }];
};
