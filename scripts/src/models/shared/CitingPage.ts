// A markdown page in the trees that cite code by hand, with its text reduced to the prose that cites: fenced
// Blocks and double-backtick spans are stripped, since a fence is a program and a span quotes a backticked phrase.
export interface CitingPage {
  path: string;
  text: string;
}
