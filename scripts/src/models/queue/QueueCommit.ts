// A commit on the queue, read for the replay: the sha to carry, and the author date and subject the collector keeps
// When it ports a commit, which is how a commit the remote already carries is recognised
export interface QueueCommit {
  authorDate: string;
  sha: string;
  subject: string;
}
