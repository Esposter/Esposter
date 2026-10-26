import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { BlockDocumentInput } from "headless-block-editor";
import type { z } from "zod";

import { createBlockDocumentSchema } from "headless-block-editor";

// The email's document schema: its content parsed by the body's children schema, its root props by the registry's root schema, and its nodes walked through the children port
export const createMjmlDocumentSchema = <TContext>(
  registry: MjmlRegistry<TContext>,
  bodyChildrenSchema: z.ZodType<MjmlNode>,
  maxNodes: number,
): z.ZodType<MjmlDocument, BlockDocumentInput> =>
  createBlockDocumentSchema(bodyChildrenSchema, registry, registry.children, maxNodes);
