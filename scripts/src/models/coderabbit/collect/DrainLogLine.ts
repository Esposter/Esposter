// One line of the drain's log. Narration is the model's own prose, tool calls and closing message; everything
// Else is Claude Code speaking for itself — the sentence it prints instead of starting, the reason a session
// Ended short of success — and only that is read for a limit, because a session fixing the collector's own limit
// Parser narrates the parser's words, in its last message as readily as in any turn before it.
export interface DrainLogLine {
  isNarration: boolean;
  text: string;
}
