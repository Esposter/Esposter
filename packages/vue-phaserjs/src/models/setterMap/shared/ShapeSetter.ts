export const ShapeSetter = { FillAlpha: "fillAlpha", FillColor: "fillColor", StrokeStyle: "strokeStyle" } as const;
export type ShapeSetter = (typeof ShapeSetter)[keyof typeof ShapeSetter];
