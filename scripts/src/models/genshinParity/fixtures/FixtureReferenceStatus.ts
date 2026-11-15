// Whether a fixture screen or variant has a reference: one measured, one named pending with its reason, or none at all
export const FixtureReferenceStatus = { Entry: "entry", None: "none", Pending: "pending" } as const;
export type FixtureReferenceStatus = (typeof FixtureReferenceStatus)[keyof typeof FixtureReferenceStatus];
