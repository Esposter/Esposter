// How a document renders: the context each consumer leaf's render receives, and whether each node's id is stamped as its
// css-class for the proof to find its box
export interface RenderMjmlDocumentOptions<TContext = undefined> {
  context: TContext;
  isStampingIds: boolean;
}
