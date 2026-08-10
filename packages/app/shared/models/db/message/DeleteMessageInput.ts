import type { z } from "zod";

import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";

// Deleting a message needs nothing but its key today, so this is an alias rather than a second copy — but it
// Keeps its own name because the name is the seam: the emitter, the hook registry and the client store all
// Type their handler on "what deleteMessage takes", not on "what a message key is", so a field added here
// Never has to be chased through them. A procedure whose input is only ever the key uses the key directly
export const deleteMessageInputSchema = messageCompositeKeySchema;
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
