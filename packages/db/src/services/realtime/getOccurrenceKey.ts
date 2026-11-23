// The key a table occurrence is named by in a statement: its table, the alias or name the statement gives it, and the
// Level it Is declared in, so one occurrence of a table is told apart from another of it, even one of the same name in
// Another level
export const getOccurrenceKey = ({
  level,
  occurrence,
  table,
}: {
  level: number;
  occurrence: string;
  table: string;
}): string => JSON.stringify([table, occurrence, level]);
