import type { CommitAttempts } from "#src/models/coderabbit/collect/CommitAttempts";
import type { CommitAttemptsInput } from "#src/models/coderabbit/collect/CommitAttemptsInput";

import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";

// The attempts a capped step has made at one commit (`getAttempts`), read from and recorded to that commit's own
// Comments — the record for a queue commit outlives any pull request
export const readCommitAttempts = ({ sha, ...commitAttemptsInput }: CommitAttemptsInput): CommitAttempts => {
  const comments = readCommitComments(sha);
  const attempts = getAttempts({
    ...commitAttemptsInput,
    comments,
    key: sha,
    post: (body) => {
      postCommitComment(sha, body);
    },
  });
  return { ...attempts, comments };
};
