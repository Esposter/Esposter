export interface ReadResourceContentResult {
  // The JSON at the pointer, or the page of an array there; left out past the read cap, null for content never saved
  content?: unknown;
  contentVersion: number;
  // An array's whole length beside the page of it
  length?: number;
  // Past the read cap, the size of each member in place of the content, so a narrower read can be chosen
  memberSizes?: Record<string, number>;
  // Past the read cap, a leaf's size in place of its content: the UTF-8 byte length of its JSON encoding, quotes included
  size?: number;
}
