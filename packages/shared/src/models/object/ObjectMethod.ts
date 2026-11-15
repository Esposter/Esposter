export const ObjectMethod = { ToString: "toString", ValueOf: "valueOf" } as const;
export type ObjectMethod = (typeof ObjectMethod)[keyof typeof ObjectMethod];
