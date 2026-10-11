// The repository's newest commit comments as `readNewestCommitComments` selects them, GitHub's own spelling
export interface CommitCommentsPage {
  data: {
    repository: {
      commitComments: {
        nodes: {
          // GitHub answers `null` for a comment whose author no longer resolves — a deleted account
          author: null | { login: string };
          body: string;
          createdAt: string;
          databaseId: number;
        }[];
      };
    };
  };
}
