export const MenuOption = { Cancel: "Cancel", Move: "Move", Release: "Release", Summary: "Summary" } as const;
export type MenuOption = (typeof MenuOption)[keyof typeof MenuOption];
