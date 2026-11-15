export const ActivePanel = { AttackOption: "AttackOption", Info: "Info", Option: "Option" } as const;
export type ActivePanel = (typeof ActivePanel)[keyof typeof ActivePanel];
