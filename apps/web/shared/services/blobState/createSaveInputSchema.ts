import { MAX_ETAG_LENGTH } from "#shared/services/blobState/constants";
import { z } from "zod";

// A save of a blob-held document: its data, and the etag of the version the save is based on
export const createSaveInputSchema = <TSchema extends z.ZodType>(dataSchema: TSchema) =>
  z.object({ data: dataSchema, etag: z.string().max(MAX_ETAG_LENGTH).optional() });
