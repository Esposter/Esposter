// A document as its schema takes it in: its content as an array and its root's props.
// Each node's and the props' own input is left open.
export interface BlockDocumentInput {
  content: unknown[];
  root: { props: unknown };
}
