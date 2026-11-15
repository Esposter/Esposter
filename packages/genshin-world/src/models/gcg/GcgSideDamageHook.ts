// The hooks a side's field cards are run through for the damage they return: before the side is handed its choice of action,
// And when the side declares its round's end
export const GcgSideDamageHook = {
  OnBeforeAction: "onBeforeAction",
  OnRoundEndDeclared: "onRoundEndDeclared",
} as const;
export type GcgSideDamageHook = (typeof GcgSideDamageHook)[keyof typeof GcgSideDamageHook];
