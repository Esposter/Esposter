export const TriangleSetter = { To: "to" } as const;
export type TriangleSetter = (typeof TriangleSetter)[keyof typeof TriangleSetter];
