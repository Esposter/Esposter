import { COMPONENT_PATH_REGEX, REFERENCE_TOKEN_REGEX } from "#src/services/genshinParity/componentReference/constants";

// The component files a spec names on a line that also names a reference. A bare path names no reference, so it holds
// Nothing, and a line naming the reference alone holds no component
export const readCitedComponents = (specTexts: readonly string[]): Set<string> =>
  new Set(
    specTexts.flatMap((text) =>
      text
        .split("\n")
        .filter((line) => REFERENCE_TOKEN_REGEX.test(line))
        .flatMap((line) => Array.from(line.matchAll(COMPONENT_PATH_REGEX), ([path]) => path)),
    ),
  );
