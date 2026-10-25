// A number at the path's scale, with no leading zero and no trailing one
export const formatNumber = (value: number, scale: number): string => {
  const sign = value < 0 ? "-" : "";
  const magnitude = Math.abs(value);
  const whole = Math.floor(magnitude / scale);
  const fraction = magnitude % scale;
  if (!fraction) return `${sign}${whole}`;
  const digits = String(fraction)
    .padStart(String(scale).length - 1, "0")
    .replace(/0+$/u, "");
  return `${sign}${whole || ""}.${digits}`;
};
