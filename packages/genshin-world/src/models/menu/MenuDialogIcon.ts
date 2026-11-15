// The icons of a dialog the Paimon menu opens: its close cross, and the ornament at its frame's corner, drawn at each
// Corner by mirroring
export const MenuDialogIcon = { Close: "Close", Corner: "Corner" } as const;
export type MenuDialogIcon = (typeof MenuDialogIcon)[keyof typeof MenuDialogIcon];
