export interface ReviewThreadsPage {
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: {
            // GitHub answers `null` for a comment whose author no longer resolves — a deleted account
            firstComment: { nodes: { author: null | { login: string }; body: string; databaseId: number }[] };
            isResolved: boolean;
            lastComment: { nodes: { author: null | { login: string } }[] };
            // GitHub answers `null` for a thread whose lines the diff no longer carries
            line: null | number;
            path: string;
          }[];
        };
      };
    };
  };
}
