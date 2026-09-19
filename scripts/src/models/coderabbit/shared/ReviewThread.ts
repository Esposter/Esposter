// One unresolved inline finding, flattened out of the GraphQL thread that carries it. `commentId` is the REST
// Comment id a reply is posted against, which is why the query asks for `databaseId` rather than the node id.
// `lastAuthorLogin` is who spoke last on the thread: the bot means the finding is still open, and anyone else
// Means `lastBody` is the answer it got — the rejection the drain wrote, or a person's own reply.
export interface ReviewThread {
  body: string;
  commentId: number;
  lastAuthorLogin: string;
  lastBody: string;
  line?: number;
  path: string;
}
