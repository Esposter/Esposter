import { z } from "zod";

export type XmlDataSourceConfiguration = Record<string, never>;

export const xmlDataSourceConfigurationSchema = z.object({}) satisfies z.ZodType<XmlDataSourceConfiguration>;
