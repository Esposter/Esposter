export const VisibleSetter = { Visible: "visible" } as const;
export type VisibleSetter = (typeof VisibleSetter)[keyof typeof VisibleSetter];
