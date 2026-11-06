// The selection kinds the survey's layout names. Nothing selected is the empty kind, which the layout context carries as "", and
// Every selected node is one kind, since a node's own settings are drawn by its kind's schema inside the Properties tab
export enum SurveyEditorSelectionKind {
  Node = "node",
}
