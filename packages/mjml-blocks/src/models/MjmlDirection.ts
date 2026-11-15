export const MjmlDirection = { Auto: "auto", Ltr: "ltr", Rtl: "rtl" } as const;
export type MjmlDirection = (typeof MjmlDirection)[keyof typeof MjmlDirection];
