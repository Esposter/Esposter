import { QueueCommit } from "#src/models/queue/QueueCommit";

const getPortKey = ({ authorDate, subject }: QueueCommit): string => `${authorDate} ${subject}`;

// The collector ports a commit by keeping its author date to the second and its subject, so the pair names one commit,
// Where a subject alone can be another session's (`chore: format`). A local commit the remote already carries is the
// Collector's port of it and is skipped; the rest are replayed in their order
export const selectReplayCommits = (localCommits: QueueCommit[], remoteCommits: QueueCommit[]): QueueCommit[] => {
  const remotePortKeys = new Set(remoteCommits.map(getPortKey));
  return localCommits.filter((commit) => !remotePortKeys.has(getPortKey(commit)));
};
