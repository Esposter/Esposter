// Each check the critique of a webpage reports: a failure, or a check that could not run, which is never a pass
export const CritiqueFindingKind = {
  LowContrast: "LowContrast",
  UncheckedContrast: "UncheckedContrast",
  UncheckedSurvey: "UncheckedSurvey",
  UnpublishedSurvey: "UnpublishedSurvey",
  WideFixedWidth: "WideFixedWidth",
} as const;
export type CritiqueFindingKind = (typeof CritiqueFindingKind)[keyof typeof CritiqueFindingKind];
