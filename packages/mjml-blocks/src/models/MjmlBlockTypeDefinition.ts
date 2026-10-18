import type { MjmlJson } from "#src/models/MjmlJson";
import type { BlockNode, BlockTypeDefinition } from "headless-block-editor";

// A registry entry for an MJML block type, with the attributes MJML takes on it and how it renders to MJML's JSON form
export interface MjmlBlockTypeDefinition extends BlockTypeDefinition {
  allowedAttributes: Record<string, string>;
  defaultAttributes: Record<string, string>;
  render: (node: BlockNode, slots: Record<string, MjmlJson[]>) => MjmlJson;
}
