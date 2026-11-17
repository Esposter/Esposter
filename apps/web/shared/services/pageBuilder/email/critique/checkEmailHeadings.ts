import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EmailHeading } from "#shared/models/pageBuilder/EmailHeading";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";

// A heading with no text is reported, and so is one sitting more than one level below the heading before it in the email. The
// First heading has nothing before it, so only the empty check applies to it
export const checkEmailHeadings = (headings: readonly EmailHeading[]): CritiqueFinding[] =>
  headings.flatMap(({ isEmpty, level, nodeId }, index): CritiqueFinding[] => {
    if (isEmpty) return [{ kind: CritiqueFindingKind.EmptyHeading, nodeId }];

    const previousHeading = index === 0 ? undefined : headings[index - 1];
    return previousHeading && level > previousHeading.level + 1
      ? [{ kind: CritiqueFindingKind.SkippedHeading, nodeId }]
      : [];
  });
