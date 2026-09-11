import type { GitHubEntry } from "#src/coderabbit/models/GitHubEntry";

// Oldest first, which is the order every reader here wants: the newest of anything is the last one that matches.
// `updated_at` rather than `created_at`, because the walkthrough comment is edited in place across reviews — its
// `created_at` stays pinned to the first review — and an edit keeps the original id, so the newest id can be a
// Comment that has not moved. `id` is the tie-breaker for two comments written in the same second, never the key.
export const getSortedByUpdatedAt = <TEntry extends GitHubEntry>(entries: TEntry[]): TEntry[] =>
  entries.toSorted((a, b) => a.updated_at.localeCompare(b.updated_at) || a.id - b.id);
