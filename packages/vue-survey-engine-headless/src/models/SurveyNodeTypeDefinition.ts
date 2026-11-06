import type { BlockNode, BlockTypeDefinition, OwnProps } from "vue-block-editor-headless";
import type { z } from "zod";

// The shared half of a survey node type, typed by the node it defines: the props a new node starts with, the form its owner
// Edits them in, and the label the editor lists it under
// Each node type file writes its own type out, not inferred, so the schema's shape survives into the emitted declaration
export interface SurveyNodeTypeDefinition<TNode extends BlockNode = BlockNode> extends BlockTypeDefinition<TNode> {
  // The props a new node starts with, without the id, which the creator adds since a node's id is not one of its own props
  createDefaultProps: () => OwnProps<TNode["props"]>;
  formSchema: z.ZodObject;
  label: string;
}
