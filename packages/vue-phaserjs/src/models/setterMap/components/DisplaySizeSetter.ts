export const DisplaySizeSetter = { DisplayHeight: "displayHeight", DisplayWidth: "displayWidth" } as const;
export type DisplaySizeSetter = (typeof DisplaySizeSetter)[keyof typeof DisplaySizeSetter];
