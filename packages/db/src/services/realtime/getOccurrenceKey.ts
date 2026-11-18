// The key a table occurrence is named by in a statement: its table and the alias or name the statement gives it, so one
// Occurrence of a table is told apart from another of it
export const getOccurrenceKey = ({ occurrence, table }: { occurrence: string; table: string }): string =>
  JSON.stringify([table, occurrence]);
