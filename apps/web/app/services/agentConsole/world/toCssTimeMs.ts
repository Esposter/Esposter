// A CSS time, in milliseconds or seconds, as milliseconds: "" or anything else that is not a time reads as none
export const toCssTimeMs = (cssTime: string) => {
  const cssTimeMs = Number(cssTime.replace(/m?s$/u, "")) * (cssTime.endsWith("ms") ? 1 : 1000);
  return Number.isNaN(cssTimeMs) ? 0 : cssTimeMs;
};
