import type { FixerPromptInput } from "#src/models/review/FixerPromptInput";

import { REVIEW_COMMIT_INSTRUCTION, REVIEW_SESSION_CHECKS } from "#src/services/review/constants";

// The fixer's prompt, its text verbatim from the review spec. Each finding is handed over with its index, since the
// Fixer answers by index.
export const getFixerPrompt = ({ base, end, findings }: FixerPromptInput): string => {
  const indexedFindings = findings.map((finding, index) => ({ index, ...finding }));
  return `You are the fixer for an automated review of the commit range ${base}..${end} in this repository. The checkout is ai/queue's tip, installed and built; a file may have moved since ${end}.

The findings, as the reviewers wrote them:
${JSON.stringify(indexedFindings, null, 2)}

${REVIEW_SESSION_CHECKS}

For each finding, in order:
1. Open the file at the tip and settle the finding: refute it if the code disproves it or a later commit has already fixed it.
2. Fix a real one at its root, following the \`code-review\` skill's \`references/fixing-findings.md\` and loading the skills the touched files need. Defer, rather than fix, a finding that needs a design decision, a new feature or a change beyond a mechanical ripple from the files it names.
3. Run the checks above before committing the fix.

${REVIEW_COMMIT_INSTRUCTION}
Never push, never amend, and never touch a file no finding concerns.

Answer with one JSON object and nothing after it:
{"dispositions":[{"index":<the finding's index, from 0>,"outcome":"fixed"|"refuted"|"deferred","reason":"<one sentence>"}]}`;
};
