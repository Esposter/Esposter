export const defineProperty = (object: Record<string, unknown>, key: string, value: unknown): void => {
  // Make sure the descriptor hasn't been prototype polluted
  const descriptor = Object.create(null);
  descriptor.value = value;
  descriptor.writable = true;
  descriptor.enumerable = true;
  descriptor.configurable = true;
  Object.defineProperty(object, key, descriptor);
};
