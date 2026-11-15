// What `verify` reports for one reference: checked and within tolerance, checked and over it, or not checked, with why
export const VerifyOutcome = { Fail: "fail", NotCheckable: "not checkable", Pass: "pass", Skipped: "skipped" } as const;
export type VerifyOutcome = (typeof VerifyOutcome)[keyof typeof VerifyOutcome];
