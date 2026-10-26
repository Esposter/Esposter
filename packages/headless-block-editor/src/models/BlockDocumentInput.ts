// A document as its schema takes it in: its content as an array and its root's props, each node's and the props' own input left open
export interface BlockDocumentInput {
  content: unknown[];
  root: { props: unknown };
}
