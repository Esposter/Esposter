import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { MIN_TEXT_CONTRAST_RATIO } from "#shared/services/pageBuilder/critique/constants";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { exhaustiveGuard } from "@esposter/shared";

// What a finding says, and the meaning its row is marked with: a failed check is a warning, and a check that could not run
// Is information, since it is never a pass
export const getCritiqueFindingSummary = (
  finding: CritiqueFinding,
): { description: string; meaning: UiIconMeaning } => {
  switch (finding.kind) {
    case CritiqueFindingKind.EmptyHeading:
      return { description: "Heading with no text", meaning: UiIconMeaning.Warning };
    case CritiqueFindingKind.LinkWithoutAddress:
      return { description: "Link with no address, so it goes nowhere", meaning: UiIconMeaning.Warning };
    case CritiqueFindingKind.LinkWithoutText:
      return { description: "Link with no text, so there is nothing to press", meaning: UiIconMeaning.Warning };
    case CritiqueFindingKind.LowContrast:
      return {
        description: `Contrast ${finding.contrastRatio.toFixed(2)} to 1, under the ${MIN_TEXT_CONTRAST_RATIO} to 1 a text needs`,
        meaning: UiIconMeaning.Warning,
      };
    case CritiqueFindingKind.SkippedHeading:
      return { description: "Heading more than one level below the heading before it", meaning: UiIconMeaning.Warning };
    case CritiqueFindingKind.UncheckedContrast:
      return { description: "Contrast not checked: a colour here cannot be read", meaning: UiIconMeaning.Info };
    case CritiqueFindingKind.UncheckedSurvey:
      return { description: "Survey not checked: its publish state could not be read", meaning: UiIconMeaning.Info };
    case CritiqueFindingKind.UnpublishedSurvey:
      return { description: "Invite to a survey with no published version", meaning: UiIconMeaning.Warning };
    case CritiqueFindingKind.WideFixedWidth:
      return {
        description: `Fixed width of ${finding.phoneWidthInPixels}px is wider than a phone`,
        meaning: UiIconMeaning.Warning,
      };
    default:
      return exhaustiveGuard(finding);
  }
};
