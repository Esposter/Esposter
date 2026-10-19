// The own value a props object holds under a key, or undefined when it holds none, unknown until the caller narrows it
export const getBlockPropValue = (props: object, key: string): unknown =>
  Object.hasOwn(props, key) ? Reflect.get(props, key) : undefined;
