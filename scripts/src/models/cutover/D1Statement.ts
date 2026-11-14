// A statement with its values bound as parameters. The SQL text never carries a value, so a value cannot change a statement
export interface D1Statement {
  params: (number | string | null)[];
  sql: string;
}
