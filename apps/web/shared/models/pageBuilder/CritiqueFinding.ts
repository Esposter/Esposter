import type { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";

export type CritiqueFinding =
  | { contrastRatio: number; kind: CritiqueFindingKind.LowContrast; nodeId: string }
  | { kind: CritiqueFindingKind.UncheckedContrast; nodeId: string }
  | { kind: CritiqueFindingKind.UncheckedSurvey; nodeId: string }
  | { kind: CritiqueFindingKind.UnpublishedSurvey; nodeId: string }
  | { kind: CritiqueFindingKind.WideFixedWidth; nodeId: string; phoneWidthInPixels: number };
