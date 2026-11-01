import { TypedEventEmitter } from "#src/models/eventEmitter/TypedEventEmitter";
import { describe, expect, expectTypeOf, test } from "vitest";

interface Events {
  ping: (value: number) => void;
  pong: () => void;
}

describe(TypedEventEmitter, () => {
  test("emit takes only the event names the map declares", () => {
    expect.hasAssertions();

    expectTypeOf<TypedEventEmitter<Events>["emit"]>().parameter(0).toEqualTypeOf<"ping" | "pong">();
  });

  test("on types the listener by the event", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();

    emitter.on("ping", (value) => {
      expectTypeOf(value).toEqualTypeOf<number>();
    });
  });
});
