import { checkIsDeepEqual } from "#src/util/object/checkIsDeepEqual";
import { describe, expect, test } from "vitest";

const identity = () => 1;

describe(checkIsDeepEqual, () => {
  test(checkIsDeepEqual, () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(1, 1)).toBe(true);
    expect(checkIsDeepEqual(1, "1")).toBe(false);
    expect(checkIsDeepEqual(0, -0)).toBe(true);
    expect(checkIsDeepEqual(undefined, null)).toBe(false);
  });

  test("#6 NaN equals NaN", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(checkIsDeepEqual({ value: Number.NaN }, { value: Number.NaN })).toBe(true);
  });

  test("compares arrays by their elements, in order", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual([1, [2]], [1, [2]])).toBe(true);
    expect(checkIsDeepEqual([1, 2], [2, 1])).toBe(false);
    expect(checkIsDeepEqual([1], [1, 2])).toBe(false);
  });

  test("#132 an array and an array-like object are unequal in both argument orders", () => {
    expect.hasAssertions();

    const array = ["a", "b"];
    const arrayLike = { 0: "a", 1: "b", constructor: Array, length: 2 };
    expect(checkIsDeepEqual(array, arrayLike)).toBe(false);
    expect(checkIsDeepEqual(arrayLike, array)).toBe(false);
  });

  test("compares objects by their own enumerable keys, recursively", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(checkIsDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(checkIsDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  test("#127 a key holding undefined is not a missing key", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual({ a: undefined }, {})).toBe(false);
  });

  test("#136 compares symbol keys", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual({ [Symbol.for("hi")]: 1 }, { [Symbol.for("hi")]: 2 })).toBe(false);
    expect(checkIsDeepEqual({ [Symbol.for("hi")]: 1 }, { [Symbol.for("hi")]: 1 })).toBe(true);
  });

  test("a non-enumerable key on the second object is not a match", () => {
    expect.hasAssertions();

    const second = Object.defineProperty({ b: 2 }, "a", { enumerable: false, value: 1 });
    expect(checkIsDeepEqual({ a: 1 }, second)).toBe(false);
  });

  test("#49 and #111 objects with a null prototype compare without throwing", () => {
    expect.hasAssertions();

    const first = Object.assign(Object.create(null) as object, { a: 1 });
    const second = Object.assign(Object.create(null) as object, { a: 1 });
    expect(checkIsDeepEqual(first, second)).toBe(true);
    expect(checkIsDeepEqual(first, { a: 1 })).toBe(false);
  });

  test("#141 an object whose toString or valueOf is a data field compares by its keys", () => {
    expect.hasAssertions();

    const first = { to: "3", toString: "In Progress" };
    const second = { to: "3", toString: "In Progress" };
    expect(checkIsDeepEqual(first, second)).toBe(true);
    expect(checkIsDeepEqual({ valueOf: "foo" }, {})).toBe(false);
    expect(checkIsDeepEqual({}, { valueOf: "foo" })).toBe(false);
  });

  test("#26 #47 #50 #151 Map and Set compare their contents", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new Map([["a", 1]]), new Map([["a", 1]]))).toBe(true);
    expect(checkIsDeepEqual(new Map([["a", 1]]), new Map([["b", 1]]))).toBe(false);
    expect(checkIsDeepEqual(new Map([["a", 1]]), new Map([["a", 2]]))).toBe(false);
    expect(checkIsDeepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true);
    expect(checkIsDeepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    expect(checkIsDeepEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false);
  });

  test("#137 a Set holds its members by identity", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new Set([{ foo: "bar" }]), new Set([{ foo: "bar" }]))).toBe(false);
  });

  test("#29 typed arrays and buffers compare their bytes", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new Int16Array([1, 2]), new Int16Array([1, 2]))).toBe(true);
    expect(checkIsDeepEqual(new Int16Array([1, 2]), new Int16Array([1, 3]))).toBe(false);
    expect(checkIsDeepEqual(new ArrayBuffer(2), new ArrayBuffer(2))).toBe(true);
    expect(checkIsDeepEqual(new ArrayBuffer(2), new ArrayBuffer(3))).toBe(false);
  });

  test("#35 a BigInt64Array compares its values", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new BigInt64Array([1n]), new BigInt64Array([1n]))).toBe(true);
    expect(checkIsDeepEqual(new BigInt64Array([1n]), new BigInt64Array([2n]))).toBe(false);
  });

  test("#157 a DataView compares its own byte range", () => {
    expect.hasAssertions();

    const buffer = new Uint8Array([9, 1, 2, 9]).buffer;
    expect(checkIsDeepEqual(new DataView(buffer, 1, 2), new DataView(new Uint8Array([1, 2]).buffer))).toBe(true);
    expect(checkIsDeepEqual(new DataView(buffer, 1, 2), new DataView(new Uint8Array([1, 3]).buffer))).toBe(false);
  });

  test("regexp compares its source and flags", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(/a/giu, /a/giu)).toBe(true);
    expect(checkIsDeepEqual(/a/gu, /a/iu)).toBe(false);
    expect(checkIsDeepEqual(/a/gu, /b/gu)).toBe(false);
  });

  test("#138 date compares its time value, and two invalid dates are equal", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new Date(0), new Date(0))).toBe(true);
    expect(checkIsDeepEqual(new Date(0), new Date(1))).toBe(false);
    expect(checkIsDeepEqual(new Date(Number.NaN), new Date(Number.NaN))).toBe(true);
  });

  test("#53 two distinct WeakMaps, WeakSets or Promises are unequal", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new WeakMap(), new WeakMap())).toBe(false);
    expect(checkIsDeepEqual(new WeakSet(), new WeakSet())).toBe(false);
    expect(checkIsDeepEqual(Promise.resolve(), Promise.resolve())).toBe(false);
  });

  test("#24 #28 functions compare by identity", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(identity, identity)).toBe(true);
    expect(
      checkIsDeepEqual(
        () => 1,
        () => 1,
      ),
    ).toBe(false);
  });

  test("#66 an object with its own valueOf compares by it", () => {
    expect.hasAssertions();

    expect(checkIsDeepEqual(new Object(1), new Object(1))).toBe(true);
    expect(checkIsDeepEqual(new Object(1), new Object(2))).toBe(false);
  });
});
