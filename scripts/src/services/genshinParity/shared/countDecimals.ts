// The decimals a number needs once its exponent is written out, so 7e-3 needs three and 0.5 needs one
export const countDecimals = (numberText: string): number => {
  const [mantissa = "", exponent = "0"] = numberText.toLowerCase().split("e");
  const [, fraction = ""] = mantissa.split(".");
  return Math.max(0, fraction.length - Number(exponent));
};
