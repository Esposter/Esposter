import { z } from "zod";

export enum DataSourceType {
  // Api = "Api",
  Csv = "Csv",
  // Excel = "Excel",
  // Sql = "Sql",
}

export const dataSourceTypeSchema = z.enum(DataSourceType) satisfies z.ZodType<DataSourceType>;
