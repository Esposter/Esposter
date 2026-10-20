// How a document renders: the context each consumer leaf's render receives, and whether each node's id is stamped as its
// Css-class for the proof to find its box
export interface RenderMjmlDocumentOptions<TContext = unknown> {
  context: TContext;
  isStampingIds: boolean;
}
