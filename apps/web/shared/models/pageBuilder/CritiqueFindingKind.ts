// Each check the critique of a page or an email reports: a failure, or a check that could not run, which is never a pass
export const CritiqueFindingKind = {
  EmptyHeading: "EmptyHeading",
  LinkWithoutAddress: "LinkWithoutAddress",
  LinkWithoutText: "LinkWithoutText",
  LowContrast: "LowContrast",
  SkippedHeading: "SkippedHeading",
  UncheckedContrast: "UncheckedContrast",
  UncheckedSurvey: "UncheckedSurvey",
  UnpublishedSurvey: "UnpublishedSurvey",
  WideFixedWidth: "WideFixedWidth",
} as const;
export type CritiqueFindingKind = (typeof CritiqueFindingKind)[keyof typeof CritiqueFindingKind];
