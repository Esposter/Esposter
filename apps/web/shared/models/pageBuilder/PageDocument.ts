// Puck's Data, without the zones it deprecated in favour of slots
export interface PageDocument<TRootProps, TNode> {
  content: TNode[];
  root: { props: TRootProps };
}
