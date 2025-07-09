import { FileKey } from "#shared/generated/phaser/FileKey";
import { z } from "zod/v4";

export const fileKeySchema = z.enum(FileKey);
