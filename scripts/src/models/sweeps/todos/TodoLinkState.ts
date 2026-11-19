// What a marker's link says of its workaround now, in the order the report lists them: what upstream has finished with
// First, then what waits on a person, then what waits on upstream
export const TodoLinkState = {
  Closed: "closed",
  Merged: "merged",
  // The marker says no upstream issue exists yet
  Unfiled: "unfiled",
  // A link GitHub has no issue or pull request for, such as a release or a webstatus.dev feature, read by hand
  Unchecked: "unchecked",
  Open: "open",
} as const;
export type TodoLinkState = (typeof TodoLinkState)[keyof typeof TodoLinkState];
