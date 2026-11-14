import type { z } from "zod";

import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";

// The key every single-message procedure addresses its target by
export const messageCompositeKeySchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type MessageCompositeKey = z.infer<typeof messageCompositeKeySchema>;
