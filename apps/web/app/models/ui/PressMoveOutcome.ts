// What a press does on a pointer move before its drag has begun: the drag starts, the press is cancelled because a finger
// Is scrolling, or the press waits
export const PressMoveOutcome = { Cancel: "Cancel", Start: "Start", Wait: "Wait" } as const;
export type PressMoveOutcome = (typeof PressMoveOutcome)[keyof typeof PressMoveOutcome];
