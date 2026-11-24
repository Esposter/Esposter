// The context a panel is shown under. Each list names the values that match.
// A list that is missing or empty matches any value.
export interface Condition {
  modes?: string[];
  selectionKinds?: string[];
  tools?: string[];
}
