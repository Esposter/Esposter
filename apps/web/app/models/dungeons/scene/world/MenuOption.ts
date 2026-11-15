export const MenuOption = { Exit: "Exit", Inventory: "Inventory", Monsters: "Monsters", Save: "Save" } as const;
export type MenuOption = (typeof MenuOption)[keyof typeof MenuOption];
