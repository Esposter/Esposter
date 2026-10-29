// The keys of a fixture's `variants` object, its top-level entries read from the source the way the parity page's own
// Test reads them, so a fixture's variants are listed without loading its component
export const getFixtureVariantNames = (fixture: string): string[] => {
  const body = /^export const variants = \{\n(?<body>[\s\S]*?)^\};/mu.exec(fixture)?.groups?.body ?? "";
  return [...body.matchAll(/^ {2}(?<variant>\w+):/gmu)].map(({ groups }) => groups?.variant ?? "");
};
