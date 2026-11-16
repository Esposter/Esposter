import type { UiSchemaFormBinding } from "#src/models/ui/schemaForm/UiSchemaFormBinding";
import type {
  ControlElement,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  UISchemaElement,
} from "@jsonforms/core";

// What the schema form's dispatch hands every renderer: the form, and a field's control or a layout's elements. Whether
// A node is enabled or read only is left unset unless the form says so, since JSON Forms derives it from the schema and
// Its parents
export interface UiSchemaFormRendererProps<TUISchemaElement extends UISchemaElement = ControlElement> {
  cells?: JsonFormsCellRendererRegistryEntry[] | undefined;
  config?: object | undefined;
  enabled?: boolean | undefined;
  form: UiSchemaFormBinding;
  path: string;
  readonly?: boolean | undefined;
  renderers?: JsonFormsRendererRegistryEntry[] | undefined;
  schema: JsonSchema;
  uischema: TUISchemaElement;
}
