export const ConfirmationMenuOption = { No: "No", Yes: "Yes" } as const;
export type ConfirmationMenuOption = (typeof ConfirmationMenuOption)[keyof typeof ConfirmationMenuOption];
