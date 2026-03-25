import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

const escapeCell = (value: string): string => value.replaceAll("|", String.raw`\|`);

export const serializeToMarkdown = (dataSource: DataSource): string => {
  const headerRow = `| ${dataSource.columns.map((column) => escapeCell(column.name)).join(" | ")} |`;
  const separatorRow = `| ${dataSource.columns.map(() => "---").join(" | ")} |`;
  const dataRows = dataSource.rows.map(
    (row) => `| ${dataSource.columns.map((column) => escapeCell(String(row.data[column.name] ?? ""))).join(" | ")} |`,
  );
  return [headerRow, separatorRow, ...dataRows].join("\n");
};
