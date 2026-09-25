import type {
  ControlElement,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  UISchemaElement,
} from "@jsonforms/core";

// What the schema form's dispatch hands every renderer, which JSON Forms' bindings read: a field's control, or a
// Layout's elements. Whether a node is enabled or read only is left unset unless the form says so, since JSON Forms
// Derives it from the schema and its parents
export interface UiSchemaFormRendererProps<TUISchemaElement extends UISchemaElement = ControlElement> {
  cells?: JsonFormsCellRendererRegistryEntry[];
  config?: object;
  enabled?: boolean;
  path: string;
  readonly?: boolean;
  renderers?: JsonFormsRendererRegistryEntry[];
  schema: JsonSchema;
  uischema: TUISchemaElement;
}
