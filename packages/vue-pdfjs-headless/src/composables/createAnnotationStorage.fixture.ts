export interface AnnotationStorage {
  [Symbol.iterator]: () => MapIterator<[string, unknown]>;
  entries: Map<string, unknown>;
  remove: (key: string) => void;
  setValue: (key: string, value: unknown) => void;
  readonly size: number;
}

// The renderer's annotation storage, which a drawn, imported or watermarked annotation is written into for a save to read
export const createAnnotationStorage = (): AnnotationStorage => {
  const entries = new Map<string, unknown>();

  return {
    entries,
    remove: (key) => {
      entries.delete(key);
    },
    setValue: (key, value) => {
      entries.set(key, value);
    },
    get size() {
      return entries.size;
    },
    [Symbol.iterator]: () => entries.entries(),
  };
};
