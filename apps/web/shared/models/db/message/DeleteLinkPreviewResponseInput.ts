import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { z } from "zod";

export const deleteLinkPreviewResponseInputSchema = z.object({ ...messageIdentityInputSchema.shape });
export type DeleteLinkPreviewResponseInput = z.infer<typeof deleteLinkPreviewResponseInputSchema>;
