// One line of the drain's log. Narration is the model's own prose and tool calls; everything else is Claude Code
// Speaking for itself — the sentence it prints instead of starting, the result it ends on — and only that is
// Read for a limit, because a session fixing the collector's own limit parser narrates the parser's words.
export interface DrainLogLine {
  isNarration: boolean;
  text: string;
}
