// An editor drawn beside a node's form for a list the form does not draw: the props key the list is held under, which
// The form leaves out, the label the editor is drawn with, and the component that edits the list
export interface SurveyNodeExtraEditor {
  component: Component;
  key: string;
  label: string;
}
