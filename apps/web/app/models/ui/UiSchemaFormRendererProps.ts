import type {
  ControlElement,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
} from "@jsonforms/core";

// What JSON Forms' dispatch hands every renderer, which its control bindings read. Whether a field is enabled or read
// Only is left unset unless the form says so, since JSON Forms derives it from the schema and its parents
export interface UiSchemaFormRendererProps {
  cells?: JsonFormsCellRendererRegistryEntry[];
  config?: object;
  enabled?: boolean;
  path: string;
  readonly?: boolean;
  renderers?: JsonFormsRendererRegistryEntry[];
  schema: JsonSchema;
  uischema: ControlElement;
}
