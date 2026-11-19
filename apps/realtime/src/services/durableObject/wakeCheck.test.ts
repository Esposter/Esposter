import type { ColumnTopic } from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { getWokenTopics } from "@esposter/db";
import { describe, expect } from "vitest";

// The contract an observed object answers: each method answers a promise of its result, as the object's RPC stub does. The
// Entry is the check's own channel, so it keeps the type the object gives it
export type ObservedContract<T> = {
  [K in keyof T]: K extends "invoke"
    ? T[K]
    : T[K] extends (...args: infer TArgs) => infer TResult
      ? (...args: TArgs) => Promise<Awaited<TResult>>
      : T[K];
};

// The entry the check goes through, which answers each call with its result, its read set and the write set it published
interface Invoker {
  invoke: (
    member: string,
    args: unknown[],
  ) => Promise<{ readSet: ColumnTopic[]; result: unknown; writeSet: ColumnTopic[] }>;
}

// An answer a read gave, with the read set it watched, kept to be asked again after a later write
interface ObservedRead {
  answer: string;
  args: unknown[];
  member: string;
  readSet: ColumnTopic[];
}

// The failures found since a test last took them, each naming the read a write changed and the write that changed it
const wakeFailures: string[] = [];
export const takeWakeFailures = (): string[] => {
  const failures = [...wakeFailures];
  wakeFailures.length = 0;
  return failures;
};

// Asserts after a test that every answer a write changed was woken by a topic that write published
export const verifyWakes = (): void => {
  expect(takeWakeFailures()).toStrictEqual([]);
};

// The methods an object's class adds to the base it extends, so each is one of its RPC methods. The base's own methods are
// Left out, as is the entry the check goes through
const getRpcMethods = (object: object): string[] => {
  const names = new Set<string>();
  for (
    let prototype: null | object = Object.getPrototypeOf(object) as null | object;
    prototype !== null && prototype !== Object.prototype && prototype !== RealtimeObject.prototype;
    prototype = Object.getPrototypeOf(prototype) as null | object
  )
    for (const name of Object.getOwnPropertyNames(prototype))
      if (name !== "constructor" && name !== "invoke") names.add(name);
  return [...names];
};

// Observes an object's RPC methods: each call runs through its entry, and a call whose write set is non-empty is a write. After
// A write, every read answered before it that recorded a read set is asked again, and an answer that changed must be one a topic
// The write published wakes, by the read set the read reported. A call that recorded no read set reads no rows, so no write
// Changes its answer through them, and it is not asked again, which keeps a call with a side effect from running twice
export const observeWakes = <T extends object>(object: T): ObservedContract<T> => {
  // The forced conversion: the object's entry is typed by its class, and the check reaches it by the name each call has

  const invoker = object as unknown as Invoker;
  const rpcMethods = new Set(getRpcMethods(object));
  const reads = new Map<string, ObservedRead>();
  // The forced conversion: the proxy answers each RPC method as a promise, which the contract types it as

  return new Proxy(object, {
    get: (target, member) => {
      const value: unknown = Reflect.get(target, member, target);
      if (typeof member !== "string" || !rpcMethods.has(member))
        return typeof value === "function" ? value.bind(target) : value;
      return async (...args: unknown[]) => {
        const { readSet, result, writeSet } = await invoker.invoke(member, args);
        if (writeSet.length === 0) {
          if (readSet.length > 0)
            reads.set(JSON.stringify([member, args]), { answer: JSON.stringify(result), args, member, readSet });
          return result;
        }
        for (const read of reads.values()) {
          // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: each read is asked in turn, against the rows the last one left
          const { result: answered } = await invoker.invoke(read.member, read.args);
          const answer = JSON.stringify(answered);
          if (answer !== read.answer && getWokenTopics(read.readSet, writeSet).length === 0)
            wakeFailures.push(
              `${read.member}(${JSON.stringify(read.args)}) changed by ${member}(${JSON.stringify(args)}), which no topic it watches woke`,
            );
          read.answer = answer;
        }
        return result;
      };
    },
  }) as ObservedContract<T>;
};

// Describes nothing: the check is imported by the object suites, which run its self-test beside it
describe.todo("wakeCheck");
