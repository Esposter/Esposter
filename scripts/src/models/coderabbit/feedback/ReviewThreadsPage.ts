export interface ReviewThreadsPage {
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: {
            firstComment: { nodes: { author: { login: string }; body: string; databaseId: number }[] };
            isResolved: boolean;
            lastComment: { nodes: { author: { login: string } }[] };
            // GitHub answers `null` for a thread whose lines the diff no longer carries
            line: null | number;
            path: string;
          }[];
        };
      };
    };
  };
}
