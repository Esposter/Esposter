import { z } from "zod";

export enum DataSourceType {
  Csv = "Csv",
  Json = "Json",
  Xlsx = "Xlsx",
}

export const dataSourceTypeSchema = z.enum(DataSourceType) satisfies z.ZodType<DataSourceType>;

export const DataSourceTypes = Object.values(DataSourceType);
