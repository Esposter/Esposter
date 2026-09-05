import type { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export class BaseTMXNode<T> {
  // Indexable signature for the other dynamic keys xml2js parses onto the node.
  [key: string]: unknown;
  readonly "#name"!: TMXNodeType;
  $!: T;
}
