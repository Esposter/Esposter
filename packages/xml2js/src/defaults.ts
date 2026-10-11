import { DefaultBuilderOptions } from "#src/DefaultBuilderOptions";
import { DefaultParserOptions } from "#src/DefaultParserOptions";

// Frozen at every depth, so a caller who reads the defaults cannot change the options every later parser starts from
const freezeDeep = <T extends object>(value: T): T => {
  for (const child of Object.values(value)) if (typeof child === "object" && child !== null) freezeDeep(child);
  return Object.freeze(value);
};

// Keyed by the upstream package's version, so a caller reading `defaults["0.2"]` finds the same keys it always has
export const defaults: { "0.2": Readonly<typeof DefaultParserOptions & typeof DefaultBuilderOptions> } = {
  "0.2": freezeDeep({ ...DefaultParserOptions, ...DefaultBuilderOptions }),
};
