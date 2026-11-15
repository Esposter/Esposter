// The four ways a menu's focus moves, by the gamepad's directional pad or its left stick
export const MenuDirection = { Down: "Down", Left: "Left", Right: "Right", Up: "Up" } as const;
export type MenuDirection = (typeof MenuDirection)[keyof typeof MenuDirection];
