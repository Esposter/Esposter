// Moves the decimal point of a number by `places` digits through its shortest decimal form, so that the shift is exact
// In decimal: `1.005` rounds to `1.01` at two places, where multiplying by 100 in binary would not
export const shiftDecimalPlaces = (value: number, places: number): number => {
  if (!Number.isFinite(value)) return value;

  const [mantissa = "", exponent = "0"] = value.toExponential().split("e");
  return Number(`${mantissa}e${Number(exponent) + places}`);
};
