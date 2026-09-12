export const EXPORTED_TYPE_MESSAGE =
  "An SFC exports no type: a shape read outside this file belongs in its own `.ts` beside the component, named after its single export. Move it there and import it back.";

export const INLINE_TYPE_MESSAGE =
  "`defineProps` takes a named type, never an inline object literal — declare `interface Props` above it.";

export const PROPS_NAME = "Props";

// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const PROPS_NAME_MESSAGE: string = `A props interface declared in an SFC is named \`${PROPS_NAME}\` — the file path already spells the rest. Rename it, or move the shape to its own \`.ts\` beside the component if another file reads it.`;
