import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { Element } from "genshin-world";
import { join } from "node:path";

// The rule the duels against the game's own residents run. Its clocks are all zero, since a duel against a resident
// Has no round to run out; its reactions and hand limit are the matchmaking rule's
export const GCG_STANDARD_RULE_ID = 2;
// Where the standard rule's slice is written, the world package's generated folder it is imported on demand from
export const GCG_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "gcg",
);
export const GCG_STANDARD_RULE_PATH: string = join(GCG_GENERATED_DIRECTORY, "standardRule.json");
// The card game's table names each element by its own name in capitals, which the world's Element enum spells otherwise
export const GcgElementTableNameMap: Map<string, Element> = new Map<string, Element>([
  ["GCG_ELEMENT_ANEMO", Element.Anemo],
  ["GCG_ELEMENT_CRYO", Element.Cryo],
  ["GCG_ELEMENT_DENDRO", Element.Dendro],
  ["GCG_ELEMENT_ELECTRO", Element.Electro],
  ["GCG_ELEMENT_GEO", Element.Geo],
  ["GCG_ELEMENT_HYDRO", Element.Hydro],
  ["GCG_ELEMENT_PYRO", Element.Pyro],
]);
