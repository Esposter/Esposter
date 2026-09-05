import { getPackagePath } from "#scripts/sweeps/sharedExportConsumers/getPackagePath";

// The `\b` this needs cannot be written into a template literal — it becomes a backspace there, and the scan
// Then reports every export as unreferenced, which reads exactly like a tree of dead code. `String.raw` is what
// Keeps it an escape, and the lookarounds do the boundary's job for a `$` in a name, which `\b` gets wrong
// Because `$` is not a word character.
const getReferenceRegex = (name: string) =>
  new RegExp(String.raw`(?<![\w$])${name.replaceAll("$", String.raw`\$`)}(?![\w$])`, "u");

// The packages naming `name`, one entry each. The caller drops the defining **package** first, not merely the
// Defining file: a second file in `packages/shared` naming the export is the library using itself, and counting
// It as a consumer lets one real consumer clear a threshold that asks for two.
export const getConsumerPackagePaths = (name: string, corpus: readonly (readonly [string, string])[]): string[] => {
  const referenceRegex = getReferenceRegex(name);
  return [...new Set(corpus.filter(([, text]) => referenceRegex.test(text)).map(([path]) => getPackagePath(path)))];
};
