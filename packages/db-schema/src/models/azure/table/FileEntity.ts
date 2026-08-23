import { BLOB_SEGMENT_REGEX, FILENAME_MAX_LENGTH } from "#src/services/azure/container/constants";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class FileEntity {
  declare filename: string;
  // Whether the sibling {prefix}/{id}.thumb blob was actually written, recorded by the uploader that wrote it.
  // Without it, a missing thumbnail can only be inferred from a failed image load — the same signal an expired
  // Read SAS gives — so whichever way the renderer reads that signal is wrong for the other case. Attachments
  // Written before it was recorded read back as false and render their original, exactly as they did then
  hasThumbnail = false;
  declare id: string;
  declare mimetype: string;
  declare size: number;

  constructor(init?: Partial<FileEntity>) {
    Object.assign(this, init);
  }
}

export const FileEntityPropertyNames = getPropertyNames<FileEntity>();

export const fileEntitySchema = z.object({
  // The upload SAS target and every delete that names this file interpolate it into a blob name
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH).regex(BLOB_SEGMENT_REGEX),
  hasThumbnail: z.boolean().default(false),
  id: z.uuid(),
  mimetype: z.string(),
  size: z.int().positive(),
}) satisfies z.ZodType<FileEntity>;
