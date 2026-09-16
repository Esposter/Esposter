export interface VerdictPromptInput {
  developSha: string;
  // The `ai:coderabbit:feedback` report — what every review said and what was answered
  feedback: string;
  level: string;
  // The walkthrough's merge-risk block as the bot wrote it, rationale included
  riskBlock: string;
  // The collector's own replies and verdict comments on the pull request — the record of what was rejected and why
  verdictComments: string[];
  verdictPath: string;
}
