import type { ReshapePromptInput } from "#src/models/coderabbit/collect/ReshapePromptInput";

import { EXPRESS_TRAILER, SESSION_DENIALS } from "#src/services/coderabbit/collect/constants";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";

// A commit alone over the cap can never ride a window, and what in it deserves a reviewer's eye is a judgement —
// A rename, a one-rule substitution a lint rule now enforces, generated output and a format pass are not, the
// Rule that made them and the hand-written change beside them are. The session repackages; it never edits. The
// Collector proves the repackaging afterwards — same final tree, every reviewable part under the cap — so the
// Prompt states the shape and the checks, not a method.
export const getReshapePrompt = ({ fileCount, sha }: ReshapePromptInput): string =>
  [
    `You are the review collector's reshaper. This checkout is detached at the parent of ${sha}, a commit on \`ai/queue\` that changes ${fileCount} files — more than the ${REVIEW_FILE_CAP} a review window may carry, so no window can take it whole. ${SESSION_DENIALS}`,
    "",
    `Rewrite it as an ordered sequence of commits on this detached HEAD whose final tree is byte-for-byte the tree of ${sha} — repackage its changes, never edit them, never add or drop one. Read \`git show --stat ${sha}\` and the diff, then stage subsets with \`git checkout ${sha} -- <paths>\` (and \`git rm\` for its deletions) and commit each part:`,
    "",
    `- A part that needs no review — every file in it is a pure rename, the same one-rule substitution a lint rule in this commit or already in the tree enforces, generated output, or a format pass — is its own commit of any size carrying the trailer line \`${EXPRESS_TRAILER}: <one sentence on why nothing in it needs a reviewer>\` (via \`git commit --trailer "${EXPRESS_TRAILER}: ..."\`). It goes straight to \`main\` after the checks, unread. Judge honestly: a mixed file is reviewable.`,
    `- Everything else — the rule itself, the config, the tests, any hand-written change — goes in commits of at most ${REVIEW_FILE_CAP} files each, carrying no such trailer, so a window can take each whole.`,
    `- Order the sequence so every prefix would leave the tree green on its own: files that a rule governs before the rule that governs them, a test with what it tests.`,
    "",
    `Keep the original subject on each part, suffixed \`(n/N)\` when there is more than one, and keep its body. A single trailered commit is a valid answer when nothing in it needs review.`,
    "",
    `When done, leave the working tree clean with nothing in progress. The collector then checks that \`git diff ${sha} HEAD\` is empty and that every untrailered commit fits the cap; a failed check counts as a failed attempt.`,
  ].join("\n");
