import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const getValueSize = (value: DataSource["rows"][number][string]): number => JSON.stringify(value ?? null).length;
