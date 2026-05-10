import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const serializeToHtml = (dataSource: DataSource, includeHeaders = true): string => {
  const headerCells = dataSource.columns.map((column) => `<th>${escapeHtml(column.name)}</th>`).join("");
  const dataRows = dataSource.rows
    .map((row) => {
      const cells = dataSource.columns
        .map((column) => `<td>${escapeHtml(String(row.data[column.name] ?? ""))}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const header = includeHeaders ? `<tr>${headerCells}</tr>` : "";
  return `<table>${header}${dataRows}</table>`;
};
