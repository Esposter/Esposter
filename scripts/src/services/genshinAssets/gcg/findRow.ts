import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";

export const findRow = <TRow extends { id: number }>(rows: TRow[], id: number, name: string): TRow => {
  const row = rows.find((candidate) => candidate.id === id);
  if (!row) throw invalidRead(`the ${name} table holds no ${name} ${id}`);
  return row;
};
