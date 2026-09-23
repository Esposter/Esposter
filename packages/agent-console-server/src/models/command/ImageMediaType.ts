import { z } from "zod";

export enum ImageMediaType {
  Gif = "image/gif",
  Jpeg = "image/jpeg",
  Png = "image/png",
  Webp = "image/webp",
}

export const imageMediaTypeSchema: z.ZodEnum<typeof ImageMediaType> = z.enum(
  ImageMediaType,
) satisfies z.ZodType<ImageMediaType>;

export const ImageMediaTypes: readonly ImageMediaType[] = Object.values(ImageMediaType);
