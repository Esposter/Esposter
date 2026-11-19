// One marker in a tracked file: the link that ends its workaround, or "" for the unfiled form and for a marker no link
// Follows, which the `todos` skill's test fails
export interface TodoMarker {
  isUnfiled: boolean;
  line: number;
  path: string;
  url: string;
}
