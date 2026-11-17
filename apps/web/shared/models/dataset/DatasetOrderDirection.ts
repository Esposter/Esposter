import { z } from "zod";

export const DatasetOrderDirection = { Ascending: "Ascending", Descending: "Descending" } as const;
export type DatasetOrderDirection = (typeof DatasetOrderDirection)[keyof typeof DatasetOrderDirection];

export const datasetOrderDirectionSchema = z.enum(DatasetOrderDirection) satisfies z.ZodType<DatasetOrderDirection>;

export const DatasetOrderDirections = Object.values(DatasetOrderDirection);
