import type { ExportReference } from "#src/models/ExportReference";

// Imports a configured export under a fixed local name, so a generated handler reads the same whatever the app called it
export const getImportStatement = ({ from, name }: ExportReference, localName: string): string =>
  `import { ${name} as ${localName} } from ${JSON.stringify(from)};`;
