import { firstCharLowerCase, normalize, parseBooleans, parseNumbers, stripPrefix } from "@/processors";
import { describe, expect, test } from "vitest";

describe(normalize, () => {
  test("lowercases", () => {
    expect.hasAssertions();

    expect(normalize("TagName")).toBe("tagname");
  });
});

describe(firstCharLowerCase, () => {
  test("lowercases only the first character", () => {
    expect.hasAssertions();

    expect(firstCharLowerCase("TagName")).toBe("tagName");
  });
});

describe(stripPrefix, () => {
  test("strips a namespace prefix but keeps xmlns", () => {
    expect.hasAssertions();

    expect(stripPrefix("ns:tag")).toBe("tag");
    expect(stripPrefix("tag")).toBe("tag");
    expect(stripPrefix("xmlns:ns")).toBe("xmlns:ns");
  });
});

describe(parseNumbers, () => {
  test("parses numeric strings and passes the rest through", () => {
    expect.hasAssertions();

    expect(parseNumbers("1")).toBe(1);
    expect(parseNumbers("-1")).toBe(-1);
    expect(parseNumbers("1.5")).toBe(1.5);
    expect(parseNumbers("1e3")).toBe(1000);
    expect(parseNumbers("")).toBe(0);
    expect(parseNumbers("text")).toBe("text");
  });
});

describe(parseBooleans, () => {
  test("parses boolean strings case-insensitively and passes the rest through", () => {
    expect.hasAssertions();

    expect(parseBooleans("true")).toBe(true);
    expect(parseBooleans("TRUE")).toBe(true);
    expect(parseBooleans("false")).toBe(false);
    expect(parseBooleans("text")).toBe("text");
  });
});
