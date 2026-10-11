import type { TimerRequest } from "@/models/shared/TimerRequest";

import { TimerMethod } from "@/models/shared/TimerMethod";
import { createWorkerTimers } from "@/services/shared/createWorkerTimers";
import { describe, expect, test, vi } from "vitest";

const delayMs = 10;

// A worker stands in as a target that takes the page's requests and fires a timer by posting its id back
const createFakeWorker = () =>
  Object.assign(new EventTarget(), { postMessage: vi.fn<(request: TimerRequest) => void>() });
const fireTimer = (worker: EventTarget, id: number) => {
  worker.dispatchEvent(new MessageEvent("message", { data: { id } }));
};

describe(createWorkerTimers, () => {
  test("hands out ids from 1 and posts each request to the worker", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);

    expect(workerTimers.setTimeout(vi.fn<() => void>(), delayMs)).toBe(1);
    expect(worker.postMessage).toHaveBeenLastCalledWith({ delayMs, id: 1, method: TimerMethod.SetTimeout });
    expect(workerTimers.setInterval(vi.fn<() => void>(), delayMs)).toBe(2);
    expect(worker.postMessage).toHaveBeenLastCalledWith({ delayMs, id: 2, method: TimerMethod.SetInterval });
  });

  test("calls an interval back with its arguments on every fire until it is cleared", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);
    const callback = vi.fn<(argument: string) => void>();
    const id = workerTimers.setInterval(callback, delayMs, "argument");

    fireTimer(worker, id);
    fireTimer(worker, id);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith("argument");

    workerTimers.clearInterval(id);
    fireTimer(worker, id);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("forgets a timeout as it fires, so a late fire calls nothing back", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);
    const callback = vi.fn<() => void>();
    const id = workerTimers.setTimeout(callback, delayMs);

    fireTimer(worker, id);
    fireTimer(worker, id);
    expect(callback).toHaveBeenCalledExactlyOnceWith();
  });

  test("a cleared timeout never calls back, and clearing it again posts nothing", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);
    const callback = vi.fn<() => void>();
    const id = workerTimers.setTimeout(callback, delayMs);

    workerTimers.clearTimeout(id);
    fireTimer(worker, id);
    workerTimers.clearTimeout(id);

    expect(callback).not.toHaveBeenCalled();
    expect(worker.postMessage).toHaveBeenLastCalledWith({ id, method: TimerMethod.ClearTimeout });
    expect(worker.postMessage).toHaveBeenCalledTimes(2);
  });

  test("clearing an id that is not pending does nothing, and does not throw", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);

    expect(() => {
      workerTimers.clearInterval(1);
      workerTimers.clearTimeout(1);
    }).not.toThrow();
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  test("a timeout with no delay fires at once, and a cleared id is not reused", () => {
    expect.hasAssertions();
    const worker = createFakeWorker();
    const workerTimers = createWorkerTimers(worker);
    const cleared = workerTimers.setTimeout(vi.fn<() => void>());
    workerTimers.clearTimeout(cleared);
    const callback = vi.fn<() => void>();
    const id = workerTimers.setTimeout(callback);

    expect(id).not.toBe(cleared);
    expect(worker.postMessage).toHaveBeenLastCalledWith({ delayMs: 0, id, method: TimerMethod.SetTimeout });
    fireTimer(worker, id);
    expect(callback).toHaveBeenCalledExactlyOnceWith();
  });
});
