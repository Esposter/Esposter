export interface ReviewThreadsPage {
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: {
            // GitHub answers `null` for a comment whose author no longer resolves — a deleted account
            comments: { nodes: { author: null | { login: string }; body: string; databaseId: number }[] };
            isResolved: boolean;
            // GitHub answers `null` for a thread whose lines the diff no longer carries
            line: null | number;
            path: string;
          }[];
        };
      };
    };
  };
}
