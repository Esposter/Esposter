import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { z } from "zod";

import { mjmlNodeChildren } from "#src/services/mjmlNodeChildren";
import { createBlockDocumentSchema } from "headless-block-editor";

// The email's document schema: its content parsed by the static node schema, its root props by the registry's root schema, and its nodes walked through the children port
export const createMjmlDocumentSchema = <TContext>(
  registry: MjmlRegistry<TContext>,
  nodeSchema: z.ZodType<MjmlNode>,
  maxNodes: number,
): z.ZodType<MjmlDocument> =>
  createBlockDocumentSchema(registry, nodeSchema, registry.root.propsSchema, mjmlNodeChildren, maxNodes);
