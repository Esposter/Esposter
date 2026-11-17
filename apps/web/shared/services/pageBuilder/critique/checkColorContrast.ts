import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EffectiveColors } from "#shared/models/pageBuilder/EffectiveColors";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { MIN_TEXT_CONTRAST_RATIO } from "#shared/services/pageBuilder/critique/constants";
import { getContrastRatio } from "#shared/services/pageBuilder/critique/getContrastRatio";

// The contrast finding of a text's colours: a ratio under the threshold, or unchecked when one of its colours could not be read
export const checkColorContrast = (nodeId: string, colors: EffectiveColors): CritiqueFinding[] => {
  if (colors.textColor === undefined || colors.background === undefined)
    return [{ kind: CritiqueFindingKind.UncheckedContrast, nodeId }];

  const contrastRatio = getContrastRatio(colors.textColor, colors.background);
  return contrastRatio < MIN_TEXT_CONTRAST_RATIO
    ? [{ contrastRatio, kind: CritiqueFindingKind.LowContrast, nodeId }]
    : [];
};
