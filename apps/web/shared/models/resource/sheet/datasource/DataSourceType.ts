import { z } from "zod";

export const DataSourceType = { Csv: "Csv", Json: "Json", Xlsx: "Xlsx", Xml: "Xml" } as const;
export type DataSourceType = (typeof DataSourceType)[keyof typeof DataSourceType];

export const dataSourceTypeSchema = z.enum(DataSourceType) satisfies z.ZodType<DataSourceType>;

export const DataSourceTypes = Object.values(DataSourceType);
