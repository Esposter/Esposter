import { getCodeView } from "#src/services/hooks/stagedImports/getCodeView";

// The module specifiers a source imports or re-exports: `import … from`, `import "…"`, `export … from` and `import("…")`,
// Each read from the code view so a commented-out or quoted import never counts
export const getImportSpecifiers = (source: string): string[] => {
  const { code, strings } = getCodeView(source);
  const staticPattern = /\b(?:import|export)\s+(?:type\s+)?(?:[^;\u0000]*?\bfrom\s+)?\u0000(\d+)\u0000/g;
  const dynamicPattern = /\bimport\s*\(\s*\u0000(\d+)\u0000\s*\)/g;
  return [...code.matchAll(staticPattern), ...code.matchAll(dynamicPattern)].map(
    (match) => strings[Number(match[1])] ?? "",
  );
};
