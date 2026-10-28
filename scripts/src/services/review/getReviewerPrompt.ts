import { REVIEW_DIFF_CHARACTER_LIMIT, REVIEW_DIFF_LINE_LIMIT } from "#src/services/review/constants";

interface ReviewerPromptInput {
  base: string;
  diff: string;
  end: string;
  files: string[];
  isDiffCut: boolean;
}

// The reviewer's prompt, its text verbatim from the review spec. The diff is cut at `REVIEW_DIFF_LINE_LIMIT`, and a cut
// One is followed by a note to read the file for the rest, since a reviewer that does not know it saw a fragment reports
// The fragment as the whole.
export const getReviewerPrompt = ({ base, diff, end, files, isDiffCut }: ReviewerPromptInput): string => {
  const cutNote = isDiffCut
    ? `\nThe diff above is cut at ${REVIEW_DIFF_LINE_LIMIT} lines or ${REVIEW_DIFF_CHARACTER_LIMIT} characters. Read the files in your batch at ${end} for the rest before you report anything about them.\n`
    : "";
  return `You are an automated code reviewer for this repository, reviewing one batch of the commit range ${base}..${end}. Your tools are read-only and the checkout is at ${end}. Nothing you write reaches a person: your findings go to a fixer session as JSON.

Your batch is these files, whose diff over the range is below:
${files.join("\n")}

1. Load the \`code-review\` skill first and follow it: both lanes, quality and correctness; only the rules its routing table loads for these files; the trigger rule and refute-first for every correctness finding; and never a finding an enforcer (typecheck, lint, a test) already owns.
2. Review the changed lines and what they break. Open any file you need. Never report a line this range did not change, unless a changed line breaks it.
3. Report only what you can tie to a file and a line. No preference beyond what a skill or AGENTS.md states. An empty list is a good result.

${diff}
${cutNote}
Answer with one JSON object and nothing after it:
{"findings":[{"file":"<repo-relative path>","line":<line number at ${end}>,"lane":"correctness"|"quality","summary":"<one sentence: what is wrong>","trigger":"<correctness: the concrete inputs or state and the wrong result they produce; quality: the rule it breaks, or the path of what it duplicates>"}]}`;
};
