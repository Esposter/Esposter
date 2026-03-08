import { z } from "zod";

export enum DataSourceType {
  // Api = "Api",
  Csv = "Csv",
  Xlsx = "Xlsx",
  // Sql = "Sql",
}

export const dataSourceTypeSchema = z.enum(DataSourceType) satisfies z.ZodType<DataSourceType>;
