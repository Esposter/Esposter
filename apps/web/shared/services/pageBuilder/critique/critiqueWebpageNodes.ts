import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { EffectiveColors } from "#shared/models/pageBuilder/EffectiveColors";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { checkFixedWidth } from "#shared/services/pageBuilder/critique/checkFixedWidth";
import { checkSurveyInvite } from "#shared/services/pageBuilder/critique/checkSurveyInvite";
import { checkTextContrast } from "#shared/services/pageBuilder/critique/checkTextContrast";
import { getEffectiveColors } from "#shared/services/pageBuilder/critique/getEffectiveColors";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { getBlockSlots } from "vue-block-editor-headless";

// Each node's own findings before those of its children, so the list reads in document order
export const critiqueWebpageNodes = (
  nodes: readonly WebpageNode[],
  inherited: EffectiveColors,
  sources: CritiqueSources,
): CritiqueFinding[] =>
  nodes.flatMap((node) => {
    const colors = getEffectiveColors(node, inherited, sources.readColor);

    return [
      ...checkFixedWidth(node),
      ...checkTextContrast(node, colors),
      ...checkSurveyInvite(node, sources.lookupSurveyPublishState),
      ...Object.values(getBlockSlots(webpageNodeChildren, node)).flatMap((slotNodes) =>
        critiqueWebpageNodes(slotNodes, colors, sources),
      ),
    ];
  });
