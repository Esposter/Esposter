import { serializePermissionsPolicy } from "#src/runtime/services/serializePermissionsPolicy";
import { describe, expect, test } from "vitest";

describe(serializePermissionsPolicy, () => {
  test("#194 a feature with several origins is written in parentheses", () => {
    expect.hasAssertions();

    expect(serializePermissionsPolicy({ geolocation: ["self", "https://a.example"] })).toBe(
      "geolocation=(self https://a.example)",
    );
  });

  test("an empty list denies the feature everywhere, and false leaves the feature out", () => {
    expect.hasAssertions();

    expect(serializePermissionsPolicy({ camera: [], microphone: false })).toBe("camera=()");
  });
});
