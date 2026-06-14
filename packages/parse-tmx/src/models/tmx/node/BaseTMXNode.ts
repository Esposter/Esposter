import type { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
// oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class BaseTMXNode<T> {
  // Indexable signature, since TypeScript private properties block proper #name access.
  [key: string]: unknown;
  $!: T;
  // Property derived from xml parsing
  // eslint-disable-next-line no-unused-private-class-members
  readonly #name!: TMXNodeType;
}
