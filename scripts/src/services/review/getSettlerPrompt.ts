import type { ReviewIssue } from "#src/models/review/ReviewIssue";

import { REVIEW_COMMIT_INSTRUCTION, REVIEW_SESSION_CHECKS } from "#src/services/review/constants";

// The settler's prompt for one review issue: the issue's body is its findings, which the prompt numbers from zero in the
// Order the body lists them. Unlike the fixer, a settler may not defer: each finding ends fixed, refuted or recorded.
export const getSettlerPrompt = ({
  body,
  number,
  title,
}: ReviewIssue): string => `You are the settler for review issue #${number} in this repository, \`${title}\`. The checkout is ai/queue's tip, installed and built; a file may have moved since the review read it.

The issue's body is the findings the review owes. They are the bullets that open with a backtick, numbered from 0 in the order the body lists them. Each finding must end in exactly one of three terminal states, and none may be deferred:
- fixed: fix it at its root, following the \`code-review\` skill's \`references/fixing-findings.md\` and loading the skills the touched files need;
- refuted: the code disproves it, and the reason says what does;
- recorded: it needs a design decision or a feature. Write it into the owning area's change or roadmap (the \`building-proposals\` and \`openspec\` skills), so the build loop takes it. Never open an issue for it.

${REVIEW_SESSION_CHECKS}

${REVIEW_COMMIT_INSTRUCTION}
Never push, never amend, never stash, and never touch a file no finding concerns.

The issue:
${body}

Answer with one JSON object and nothing after it, with every finding answered by its index:
{"dispositions":[{"index":<the finding's index, from 0>,"outcome":"fixed"|"refuted"|"recorded","reason":"<one sentence>"}]}`;
