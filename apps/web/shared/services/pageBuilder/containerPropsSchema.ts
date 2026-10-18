import { z } from "zod";

// The props of a node that holds its children in slots, each slot's own node type checking what it holds
export const containerPropsSchema = z.strictObject({ children: z.array(z.unknown()), id: z.string() });
