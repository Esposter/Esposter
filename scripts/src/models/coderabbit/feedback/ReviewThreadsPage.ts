export interface ReviewThreadsPage {
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: {
            comments: { nodes: { author: { login: string }; body: string; databaseId: number }[] };
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
