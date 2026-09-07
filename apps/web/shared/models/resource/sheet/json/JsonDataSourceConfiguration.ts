import { z } from "zod";

export type JsonDataSourceConfiguration = Record<string, never>;

export const jsonDataSourceConfigurationSchema = z.object({}) satisfies z.ZodType<JsonDataSourceConfiguration>;
