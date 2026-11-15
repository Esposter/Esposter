// The four Pointer Events a gesture takes, each the action a pointer event is read as
export const GesturePointerAction = { Cancel: "cancel", Down: "down", Move: "move", Up: "up" } as const;
export type GesturePointerAction = (typeof GesturePointerAction)[keyof typeof GesturePointerAction];
