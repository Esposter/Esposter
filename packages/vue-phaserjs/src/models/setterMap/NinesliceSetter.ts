export const NinesliceSetter = {
  BottomHeight: "bottomHeight",
  LeftWidth: "leftWidth",
  RightWidth: "rightWidth",
  TopHeight: "topHeight",
} as const;
export type NinesliceSetter = (typeof NinesliceSetter)[keyof typeof NinesliceSetter];
