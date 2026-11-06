import type { JsonPatchOperation } from "@esposter/shared";

// A move of a node the creator makes: the operations that make it when the selection can take it, and otherwise none, with the reason
// The move is refused. The reason is "" when the move lands, and is the description of the menu item that would make it otherwise
export interface SurveyNodeMove {
  operations: JsonPatchOperation[];
  refusal: string;
}
