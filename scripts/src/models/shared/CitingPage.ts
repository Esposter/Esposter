// A page that cites code, with its text reduced to what cites: a markdown page's prose, where fenced blocks and
// Double-backtick spans are stripped since a fence is a program and a span quotes a backticked phrase, or a source
// File's comments
export interface CitingPage {
  path: string;
  text: string;
}
