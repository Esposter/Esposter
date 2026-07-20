import { z } from "zod";

export enum MimeCategory {
  Audio = "Audio",
  Document = "Document",
  Image = "Image",
  Video = "Video",
}

export const mimeCategorySchema = z.enum(MimeCategory) satisfies z.ZodType<MimeCategory>;
