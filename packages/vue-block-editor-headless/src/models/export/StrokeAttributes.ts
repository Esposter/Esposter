// The attributes that draw a line in the canvas and the export alike: its colour, its width, and the dash and the cap its pattern takes. A solid
// Line has no dash, so it has no dash array, and a line whose pattern takes no cap keeps the default
export interface StrokeAttributes {
  stroke: string;
  strokeDasharray?: string;
  strokeLinecap?: "round";
  strokeWidth: number;
}
