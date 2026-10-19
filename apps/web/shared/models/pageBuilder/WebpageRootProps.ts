import { z } from "zod";

// The props of a webpage as a whole: the language its document declares
export interface WebpageRootProps {
  lang: string;
}

export const webpageRootPropsSchema = z.strictObject({ lang: z.string().min(1) }) satisfies z.ZodType<WebpageRootProps>;
