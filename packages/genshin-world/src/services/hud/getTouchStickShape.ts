import { TouchStickShape } from "#src/models/hud/TouchStickShape";

// Each recorded shape by its aspect ratio, in the order the recordings were taken
const TOUCH_STICK_SHAPE_ASPECTS: readonly { aspect: number; shape: TouchStickShape }[] = [
  { aspect: 16 / 9, shape: TouchStickShape.Ratio16x9 },
  { aspect: 19.5 / 9, shape: TouchStickShape.Ratio19Point5x9 },
  { aspect: 20 / 9, shape: TouchStickShape.Ratio20x9 },
];

// The recorded shape nearest a screen's aspect ratio, so a shape nobody recorded takes the closest one. A window with no
// Size yet has a NaN aspect, which no shape is nearer than, so the first recorded shape stands in for it
export const getTouchStickShape = (aspectRatio: number): TouchStickShape =>
  TOUCH_STICK_SHAPE_ASPECTS.reduce((nearest, candidate) =>
    Math.abs(candidate.aspect - aspectRatio) < Math.abs(nearest.aspect - aspectRatio) ? candidate : nearest,
  ).shape;
