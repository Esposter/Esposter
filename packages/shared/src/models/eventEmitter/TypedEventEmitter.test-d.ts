import { TypedEventEmitter } from "#src/models/eventEmitter/TypedEventEmitter";
import { describe, expect, expectTypeOf, test } from "vitest";

interface Events {
  ping: (value: number) => void;
  pong: () => void;
}

describe(TypedEventEmitter, () => {
  test("emit takes the arguments of the event's own listener", () => {
    expect.hasAssertions();

    expectTypeOf<TypedEventEmitter<Events>["emit"]>().toBeCallableWith("ping", 1);
    expectTypeOf<TypedEventEmitter<Events>["emit"]>().parameter(0).toEqualTypeOf<"ping" | "pong">();
  });

  test("on types the listener by the event", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();

    emitter.on("ping", (value) => {
      expectTypeOf(value).toEqualTypeOf<number>();
    });
  });

  test("a subclass inherits the event map's types", () => {
    expect.hasAssertions();

    class Subclass extends TypedEventEmitter<Events> {}

    expectTypeOf(new Subclass().emit).toBeCallableWith("pong");
  });

  test("a generic wrapper around emit keeps the event's arguments", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const wrapped = <TEvent extends keyof Events>(event: TEvent, ...args: Parameters<Events[TEvent]>) =>
      emitter.emit(event, ...args);

    expectTypeOf(wrapped).toBeCallableWith("ping", 1);
  });
});
