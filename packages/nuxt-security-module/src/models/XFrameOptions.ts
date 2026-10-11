export const XFrameOptions = { Deny: "DENY", SameOrigin: "SAMEORIGIN" } as const;
export type XFrameOptions = (typeof XFrameOptions)[keyof typeof XFrameOptions];
