import { FileKey } from "#shared/generated/phaser/FileKey";
import { z } from "zod";

export const fileKeySchema = z.enum(FileKey) satisfies z.ZodType<FileKey>;
