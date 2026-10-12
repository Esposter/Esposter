import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

const GENDER_REGEX = /\.NewTraveler\([^)]*,\s*(?<gender>\d+)\)/u;
const GENDER_READ_REGEX = /\b(?<name>[A-Za-z]\w*)\[c\.gender\]/gu;

// The constants of a gcsim package as its form reads them, where the package is the Traveler's element files a form
// Builds with its gender: each constant read at `[c.gender]` keeps a value for each gender, so it is taken at the form's,
// On the line that gender's value is set. A package no form builds this way keeps its constants as they are
export const selectGcsimGenderConstants = (
  goSources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): Map<string, GoConstant> => {
  const gender = goSources
    .map(({ source }) => GENDER_REGEX.exec(source)?.groups?.gender)
    .find((match) => match !== undefined);
  if (gender === undefined) return new Map(constantMap);
  const genderIndex = Number(gender);
  const genderNames = new Set(
    goSources.flatMap(({ source }) => Array.from(source.matchAll(GENDER_READ_REGEX), ({ groups }) => groups?.name)),
  );
  return new Map(
    Array.from(constantMap, ([name, constant]): [string, GoConstant] => {
      const { elementLines, line, value } = constant;
      return genderNames.has(name) && Array.isArray(value) && value[genderIndex] !== undefined
        ? [name, { ...constant, elementLines: {}, line: elementLines[genderIndex] ?? line, value: value[genderIndex] }]
        : [name, constant];
    }),
  );
};
