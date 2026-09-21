export interface VerdictPromptInput {
  // What answered the findings this pull request raised, one entry each: the reply on every thread the bot no
  // Longer holds (`getAnsweredFindingLines`) and the body-only verdicts, which are posted as comments. The
  // Collector's other comments are its own bookkeeping — a drain that failed, a limit, an older head's verdict —
  // And say nothing about whether a concern stands, so they are not here.
  answers: string[];
  developSha: string;
  // The `ai:coderabbit:feedback` report — what every review said and what was answered
  feedback: string;
  level?: string;
  // The walkthrough's merge-risk block as the bot wrote it, rationale included — its change assessment when it
  // Wrote no risk block for this head
  riskBlock: string;
  verdictPath: string;
}
