import { MAX_NODE_ID_LENGTH, NODE_ID_REGEX } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// A node's element id is the id its published element carries, so a fragment link reaches it. It takes the node id's length and characters, and an empty id names no element
export const elementIdSchema = z
  .string()
  .max(MAX_NODE_ID_LENGTH)
  .refine((elementId) => !elementId || NODE_ID_REGEX.test(elementId));
