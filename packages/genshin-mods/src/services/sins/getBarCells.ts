import type { SinFigures } from "../../models/SinFigures";

// The solid run reaches the score, and the tinted run the score plus its spread, both in cells of the bar's width
export const getBarCells = ({ score, spread }: SinFigures, width: number): { solid: number; tinted: number } => {
  const solid = Math.round(score * width);
  const reach = Math.round(Math.min(1, score + spread) * width);
  return { solid, tinted: Math.max(0, reach - solid) };
};
