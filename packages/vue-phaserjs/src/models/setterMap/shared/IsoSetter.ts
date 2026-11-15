export const IsoSetter = {
  FillLeft: "fillLeft",
  FillRight: "fillRight",
  FillTop: "fillTop",
  Height: "height",
  Projection: "projection",
  ShowLeft: "showLeft",
  ShowRight: "showRight",
  ShowTop: "showTop",
  Size: "size",
} as const;
export type IsoSetter = (typeof IsoSetter)[keyof typeof IsoSetter];
