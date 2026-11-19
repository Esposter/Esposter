import type { ColumnTopic } from "@esposter/db-schema";

import { observeWakes, takeWakeFailures } from "#src/services/durableObject/wakeCheck.test";
import { describe, expect, test } from "vitest";

// An object whose `bump` writes the counter's topic, and whose read reports the read set it was given
class CounterObject {
  count = 0;
  readonly #readTopics: ColumnTopic[];

  constructor(readTopics: ColumnTopic[]) {
    this.#readTopics = readTopics;
  }

  bump() {
    this.count++;
    return this.count;
  }

  async invoke(member: string, args: unknown[]) {
    // The forced conversion: the entry dispatches by the name the check passes, which the class's own methods answer

    const method = (this as unknown as Record<string, (...args: unknown[]) => unknown>)[member];
    const writeSet = member === "bump" ? [{ topic: "counter:*" }] : [];
    return { readSet: this.#readTopics, result: await method?.apply(this, args), writeSet };
  }

  read() {
    return this.count;
  }
}

describe("wakeCheck", () => {
  test("a write that changes a read whose read set names no topic it woke is reported", async () => {
    expect.hasAssertions();

    const counter = observeWakes(new CounterObject([{ topic: "other:*" }]));

    await counter.read();
    await counter.bump();

    expect(takeWakeFailures()).toHaveLength(1);
  });

  test("a write that changes a read whose read set names a topic it published is not reported", async () => {
    expect.hasAssertions();

    const counter = observeWakes(new CounterObject([{ topic: "counter:*" }]));

    await counter.read();
    await counter.bump();

    expect(takeWakeFailures()).toStrictEqual([]);
  });
});
