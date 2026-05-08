import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export const serializeToHtml = (dataSource: DataSource): string => {
  const headerCells = dataSource.columns.map((column) => `<th>${column.name}</th>`).join("");
  const dataRows = dataSource.rows
    .map((row) => {
      const cells = dataSource.columns.map((column) => `<td>${String(row.data[column.name] ?? "")}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><tr>${headerCells}</tr>${dataRows}</table>`;
};
