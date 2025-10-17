export class AsyncQueue<T> {
  private queue: T[] = [];
  private resolvers: ((value: IteratorResult<T>) => void)[] = [];

  constructor(signal?: AbortSignal) {
    signal?.addEventListener(
      "abort",
      () => {
        this.end();
      },
      { once: true },
    );
  }

  end() {
    for (const resolver of this.resolvers) resolver({ done: true, value: undefined });
    this.queue = [];
    this.resolvers = [];
  }

  push(item: T) {
    if (this.resolvers.length > 0) {
      const resolver = this.resolvers.shift();
      resolver?.({ done: false, value: item });
    } else this.queue.push(item);
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true)
      if (this.queue.length > 0) yield this.queue.shift() as Awaited<T>;
      else
        yield await new Promise<T>((resolve) => {
          this.resolvers.push(({ value }) => resolve(value));
        });
  }
}
