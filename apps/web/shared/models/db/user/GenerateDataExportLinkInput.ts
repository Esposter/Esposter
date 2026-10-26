import { selectDataExportInUserSchema } from "@esposter/db-schema";

export const generateDataExportLinkInputSchema = selectDataExportInUserSchema.shape.id;
