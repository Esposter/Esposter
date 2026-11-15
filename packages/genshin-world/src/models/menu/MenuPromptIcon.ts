// The icon a prompt's button wears, drawn on its disc: the World Level dialog's lowering arrow
export const MenuPromptIcon = { LowerWorldLevel: "LowerWorldLevel" } as const;
export type MenuPromptIcon = (typeof MenuPromptIcon)[keyof typeof MenuPromptIcon];
