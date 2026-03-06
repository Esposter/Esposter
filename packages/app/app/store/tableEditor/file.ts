import type { CsvOptions } from "#shared/models/tableEditor/file/CsvOptions";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { CsvParser } from "@/models/tableEditor/file/parsers/CsvParser";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const dataSource = ref<DataSource | null>(null);
  const selectedDataSourceType = ref<DataSourceType>(DataSourceType.Csv);
  const importFile = async (file: File, options: CsvOptions = { delimiter: CsvDelimiter.Comma }) => {
    dataSource.value = await new CsvParser().parse(file, options);
  };
  const deleteRow = (index: number) => {
    if (!dataSource.value) return;
    dataSource.value = { ...dataSource.value, rows: dataSource.value.rows.filter((_, rowIndex) => rowIndex !== index) };
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!dataSource.value) return;
    const rows = [...dataSource.value.rows];
    rows[index] = updated;
    dataSource.value = { ...dataSource.value, rows };
  };
  const deleteColumn = (name: string) => {
    if (!dataSource.value) return;
    const columns = dataSource.value.columns.filter((column) => column.name !== name);
    const rows = dataSource.value.rows.map((row) => {
      const { [name]: _, ...rest } = row;
      return rest;
    });
    dataSource.value = { ...dataSource.value, columns, rows };
  };
  const reset = () => {
    dataSource.value = null;
  };
  return { dataSource, deleteColumn, deleteRow, importFile, reset, selectedDataSourceType, updateRow };
});
