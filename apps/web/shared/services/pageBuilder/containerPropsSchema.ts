import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { z } from "zod";

// The props a node holding its children in slots declares: its style, the children being the core's slot
export const containerPropsSchema = z.object({ style: nodeStyleSchema.optional() });
