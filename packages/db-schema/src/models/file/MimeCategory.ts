import { z } from "zod";

export const MimeCategory = { Audio: "Audio", Document: "Document", Image: "Image", Video: "Video" } as const;
export type MimeCategory = (typeof MimeCategory)[keyof typeof MimeCategory];

export const mimeCategorySchema = z.enum(MimeCategory) satisfies z.ZodType<MimeCategory>;

export const MimeCategories: readonly MimeCategory[] = Object.values(MimeCategory);
