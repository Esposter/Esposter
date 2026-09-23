export interface InputQueue<T> {
  close: () => void;
  iterable: AsyncIterable<T>;
  push: (item: T) => void;
}
