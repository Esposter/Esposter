import type { ChildProcess } from "node:child_process";

import { forwardTerminationSignals } from "@/services/exec/util/forwardTerminationSignals";
import { takeOne } from "@esposter/shared";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, test, vi } from "vitest";

// Track every fake child so afterEach can trigger the helper's own `close` cleanup — removing exactly the
// Listeners it added. Never `process.removeAllListeners`: that would also wipe vitest's signal handlers and hang
// The worker on teardown.
const children: EventEmitter[] = [];

const createFakeChild = () => {
  const child = new EventEmitter();
  const kill = vi.fn<ChildProcess["kill"]>();
  Object.assign(child, { kill });
  children.push(child);
  return { child: child as unknown as ChildProcess, kill };
};

// Grab the single SIGINT listener forwardTerminationSignals just installed, so we can drive it directly
// Instead of emitting a real OS signal on `process` and disturbing the test runner.
const getAddedSignalListener = (signal: NodeJS.Signals, before: readonly unknown[]) =>
  takeOne(
    process.listeners(signal).filter((listener) => !before.includes(listener)),
    0,
  );

describe(forwardTerminationSignals, () => {
  afterEach(() => {
    for (const child of children.splice(0)) child.emit("close");
  });

  test("forwards SIGINT and SIGTERM to the child", () => {
    expect.hasAssertions();

    const { child, kill } = createFakeChild();
    const beforeSigint = process.listeners("SIGINT");
    const beforeSigterm = process.listeners("SIGTERM");
    forwardTerminationSignals(child);

    getAddedSignalListener("SIGINT", beforeSigint)?.("SIGINT");

    expect(kill).toHaveBeenCalledWith("SIGINT");

    getAddedSignalListener("SIGTERM", beforeSigterm)?.("SIGTERM");

    expect(kill).toHaveBeenCalledWith("SIGTERM");
  });

  test("runs the reaper before killing the child, and never lets it throw out of the handler", () => {
    expect.hasAssertions();

    const { child, kill } = createFakeChild();
    const onTerminate = vi.fn<() => void>(() => {
      throw new Error("reaper spawn failed");
    });
    const beforeSigint = process.listeners("SIGINT");
    forwardTerminationSignals(child, onTerminate);

    expect(() => {
      getAddedSignalListener("SIGINT", beforeSigint)?.("SIGINT");
    }).not.toThrow();
    expect(onTerminate).toHaveBeenCalledTimes(1);
    expect(kill).toHaveBeenCalledWith("SIGINT");
  });

  test("removes the listeners once the child closes", () => {
    expect.hasAssertions();

    const { child } = createFakeChild();
    const beforeSigint = process.listeners("SIGINT");
    const beforeSigterm = process.listeners("SIGTERM");
    forwardTerminationSignals(child);
    child.emit("close");

    expect(process.listeners("SIGINT")).toStrictEqual(beforeSigint);
    expect(process.listeners("SIGTERM")).toStrictEqual(beforeSigterm);
  });

  test("removes the listeners when the child errors", () => {
    expect.hasAssertions();

    const { child } = createFakeChild();
    const beforeSigint = process.listeners("SIGINT");
    forwardTerminationSignals(child);
    child.emit("error", new Error("spawn failed"));

    expect(process.listeners("SIGINT")).toStrictEqual(beforeSigint);
  });
});
