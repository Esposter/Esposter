import type { PageNode } from "#shared/models/pageBuilder/PageNode";

import { MAX_PAGE_NODE_COUNT } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// A slot's nodes are unique by id across the whole document, which the document's own refinement holds, so a slot
// Adds no uniqueness check of its own
export const createSlotSchema = <TNode extends PageNode>(nodeSchema: z.ZodType<TNode>) =>
  z.array(nodeSchema).max(MAX_PAGE_NODE_COUNT);
