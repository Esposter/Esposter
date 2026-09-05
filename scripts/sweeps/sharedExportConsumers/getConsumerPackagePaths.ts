// The `\b` this needs cannot be written into a template literal — it becomes a backspace there, and the scan
// Then reports every export as unreferenced, which reads exactly like a tree of dead code. `String.raw` is what
// Keeps it an escape, and the lookarounds do the boundary's job for a `$` in a name, which `\b` gets wrong
// Because `$` is not a word character.
const getReferenceRegex = (name: string) =>
  new RegExp(String.raw`(?<![\w$])${name.replaceAll("$", String.raw`\$`)}(?![\w$])`, "u");

// The packages naming `name`, one entry each, taken from the first two segments of every path that references
// It. The caller drops the export's own file first, so a package here is genuinely a second consumer.
export const getConsumerPackagePaths = (name: string, corpus: readonly (readonly [string, string])[]): string[] => {
  const referenceRegex = getReferenceRegex(name);
  return [
    ...new Set(
      corpus.filter(([, text]) => referenceRegex.test(text)).map(([path]) => path.split("/").slice(0, 2).join("/")),
    ),
  ];
};
