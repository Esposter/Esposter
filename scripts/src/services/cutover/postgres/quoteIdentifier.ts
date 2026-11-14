// A Postgres or SQLite identifier, quoted. Identifiers come from the schema and never from input, but quoting keeps a
// camelCase name exact on both sides
export const quoteIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;
