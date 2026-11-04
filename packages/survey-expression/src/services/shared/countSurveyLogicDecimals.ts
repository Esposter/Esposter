// The digits after the point of a number, read from its shortest digits with the exponent taken into account, so a number in exponent form such as `1e-8` carries eight.
// A whole number, and a large one in exponent form, carries none
export const countSurveyLogicDecimals = (number: number): number => {
  const [mantissa = "", exponent = "0"] = number.toExponential().split("e");
  const fraction = mantissa.split(".")[1] ?? "";

  return Math.max(fraction.length - Number(exponent), 0);
};
