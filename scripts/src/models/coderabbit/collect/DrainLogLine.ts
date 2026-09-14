// One line of the drain's log. Narration is the model's own prose and tool calls — a session fixing the
// Collector's own limit parser narrates the parser's words, so nothing it says is read for a limit. Everything
// Else is Claude Code speaking for itself: the sentence it prints instead of starting, and every result frame,
// Whose subtype is no evidence the session ran — the refusal states `success`.
export interface DrainLogLine {
  isNarration: boolean;
  text: string;
}
