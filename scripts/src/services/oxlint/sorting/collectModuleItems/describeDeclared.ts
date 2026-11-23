import type { StatementDescription } from "#src/models/oxlint/sorting/StatementDescription";

// The group a declaration sorts under: ambient declarations first, then exported ones, then the bare kind. A declaration
// With no name, such as a default export of an anonymous function, declares nothing sortable and only ends a partition
export const describeDeclared = (
  kind: string,
  name: string | undefined,
  isDeclare: boolean | undefined,
  isExported: boolean,
): StatementDescription => {
  if (name === undefined) return { endsPartition: true };
  const group = isDeclare ? `declare-${kind}` : isExported ? `export-${kind}` : kind;
  return { declaration: { group, name }, endsPartition: false };
};
