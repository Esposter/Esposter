import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EffectiveColors } from "#shared/models/pageBuilder/EffectiveColors";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MIN_TEXT_CONTRAST_RATIO } from "#shared/services/pageBuilder/critique/constants";
import { getContrastRatio } from "#shared/services/pageBuilder/critique/getContrastRatio";

export const checkTextContrast = (node: WebpageNode, colors: EffectiveColors): CritiqueFinding[] => {
  if (node.type !== WebpageNodeType.Text) return [];
  if (colors.textColor === undefined || colors.background === undefined)
    return [{ kind: CritiqueFindingKind.UncheckedContrast, nodeId: node.props.id }];

  const contrastRatio = getContrastRatio(colors.textColor, colors.background);
  return contrastRatio < MIN_TEXT_CONTRAST_RATIO
    ? [{ contrastRatio, kind: CritiqueFindingKind.LowContrast, nodeId: node.props.id }]
    : [];
};
