import type { BlockNodeProps } from "#src/models/BlockNodeProps";

// The own value a node's props hold under a key, or undefined when they hold none, unknown until the caller narrows it
export const getBlockPropValue = (props: BlockNodeProps, key: string): unknown =>
  Object.hasOwn(props, key) ? Reflect.get(props, key) : undefined;
