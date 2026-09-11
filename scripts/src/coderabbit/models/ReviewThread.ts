// One unresolved inline finding, flattened out of the GraphQL thread that carries it. `commentId` is the REST
// Comment id a reply is posted against, which is why the query asks for `databaseId` rather than the node id.
export interface ReviewThread {
  body: string;
  commentId: number;
  line?: number;
  path: string;
}
