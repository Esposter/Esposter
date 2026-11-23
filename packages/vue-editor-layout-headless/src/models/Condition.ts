// The context a panel is shown under. Each list names the values that match, and a list that is missing or empty
// Matches any value
export interface Condition {
  modes?: string[];
  selectionKinds?: string[];
  tools?: string[];
}
