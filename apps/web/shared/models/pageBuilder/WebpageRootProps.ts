import { z } from "zod";

// The props of a webpage as a whole: the language its document declares. Its type is inferred, since an inferred object
// Type takes the implicit index signature the core's root props need, where a declared interface does not
export const webpageRootPropsSchema = z.strictObject({ lang: z.string().min(1) });
export type WebpageRootProps = z.infer<typeof webpageRootPropsSchema>;
