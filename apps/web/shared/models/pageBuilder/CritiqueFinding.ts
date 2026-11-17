import type { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";

export type CritiqueFinding =
  | { contrastRatio: number; kind: typeof CritiqueFindingKind.LowContrast; nodeId: string }
  | { kind: typeof CritiqueFindingKind.EmptyHeading; nodeId: string }
  | { kind: typeof CritiqueFindingKind.LinkWithoutAddress; nodeId: string }
  | { kind: typeof CritiqueFindingKind.LinkWithoutText; nodeId: string }
  | { kind: typeof CritiqueFindingKind.SkippedHeading; nodeId: string }
  | { kind: typeof CritiqueFindingKind.UncheckedContrast; nodeId: string }
  | { kind: typeof CritiqueFindingKind.UncheckedSurvey; nodeId: string }
  | { kind: typeof CritiqueFindingKind.UnpublishedSurvey; nodeId: string }
  | { kind: typeof CritiqueFindingKind.WideFixedWidth; nodeId: string; phoneWidthInPixels: number };
