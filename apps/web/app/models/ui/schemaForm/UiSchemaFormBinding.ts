import type { CoreActions, Dispatch, JsonFormsState } from "@jsonforms/core";

// What a schema form's root hands every renderer: the core state its mapping functions read, and the dispatch its
// Changes go through
export interface UiSchemaFormBinding {
  dispatch: Dispatch<CoreActions>;
  state: JsonFormsState;
}
