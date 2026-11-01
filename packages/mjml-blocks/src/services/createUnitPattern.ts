// MJML's own pattern for a unit: values of one unit each, or 0, repeated within its count, matched as its validator matches them.
// The one departure is the comma: MJML's validator takes it as a digit, but CSS reads "1,5px" as no length, so it is refused
export const createUnitPattern = (
  units: string[],
  isNegativeAllowed: boolean,
  minCount: number,
  maxCount: number,
): RegExp => {
  const numeric = isNegativeAllowed ? String.raw`-|\d|\.` : String.raw`\d|\.`;
  const filteredUnits = units
    .filter((unit) => unit !== "auto")
    .map((unit) => RegExp.escape(unit))
    .join("|");
  const autoAlternative = units.includes("auto") ? "|auto" : "";
  return new RegExp(`^(((${numeric}){1,}(${filteredUnits})|0${autoAlternative})( )?){${minCount},${maxCount}}$`, "u");
};
