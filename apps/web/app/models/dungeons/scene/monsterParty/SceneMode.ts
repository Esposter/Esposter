export const SceneMode = { Confirmation: "Confirmation", Default: "Default", Menu: "Menu", Move: "Move" } as const;
export type SceneMode = (typeof SceneMode)[keyof typeof SceneMode];
