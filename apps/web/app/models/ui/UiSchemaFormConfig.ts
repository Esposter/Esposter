// What a schema form hands every field beside its own schema: the dialog's context, whose keys a field names for the
// Items it chooses among, and the form schema's issues, each under the path of the field it is about
export interface UiSchemaFormConfig {
  context: object;
  issueMap: Map<string, string>;
}
