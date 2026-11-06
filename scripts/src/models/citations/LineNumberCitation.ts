// A line-number citation of a file of the repository in a page: the one-based line the page holds it on, and the text
// That cites it, which is what a reader searches the page for
export interface LineNumberCitation {
  line: number;
  text: string;
}
