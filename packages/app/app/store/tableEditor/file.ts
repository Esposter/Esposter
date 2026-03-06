import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { CsvParser } from "@/models/tableEditor/file/parsers/CsvParser";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const dataSource = ref<DataSource | null>(null);
  const importFile = async (file: File) => {
    dataSource.value = await new CsvParser().parse(file);
  };
  const deleteRow = (index: number) => {
    if (!dataSource.value) return;
    dataSource.value = { ...dataSource.value, rows: dataSource.value.rows.filter((_, i) => i !== index) };
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!dataSource.value) return;
    const rows = [...dataSource.value.rows];
    rows[index] = updated;
    dataSource.value = { ...dataSource.value, rows };
  };
  const deleteColumn = (fieldName: string) => {
    if (!dataSource.value) return;
    const columns = dataSource.value.columns.filter((c) => c.fieldName !== fieldName);
    const rows = dataSource.value.rows.map((row) => {
      const { [fieldName]: _, ...rest } = row;
      return rest;
    });
    dataSource.value = { ...dataSource.value, columns, rows };
  };
  const reset = () => {
    dataSource.value = null;
  };
  return { dataSource, deleteColumn, deleteRow, importFile, reset, updateRow };
});
