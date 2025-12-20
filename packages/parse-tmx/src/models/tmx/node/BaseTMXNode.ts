import type { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class BaseTMXNode<T> {
  // We add indexable signature because we can't access #name properly
  // Due to typescript shenanigans with private properties >:C
  [key: string]: unknown;
  $!: T;
  // Property derived from xml parsing
  // eslint-disable-next-line no-unused-private-class-members
  #name!: TMXNodeType;
}
