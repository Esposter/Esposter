import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { EffectiveColors } from "#shared/models/pageBuilder/EffectiveColors";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { getEffectiveColor } from "#shared/services/pageBuilder/critique/getEffectiveColor";
import { getNodeStyle } from "#shared/services/pageBuilder/critique/getNodeStyle";

// The colours a node is drawn in at the desktop breakpoint, where its own text colour and background override what it inherits
export const getEffectiveColors = (
  node: WebpageNode,
  inherited: EffectiveColors,
  readColor: CritiqueSources["readColor"],
): EffectiveColors => {
  const desktopStyle = getNodeStyle(node)?.[StyleBreakpoint.Base]?.[StyleState.Default];

  return {
    background: getEffectiveColor(desktopStyle?.["background-color"], inherited.background, readColor),
    textColor: getEffectiveColor(desktopStyle?.color, inherited.textColor, readColor),
  };
};
