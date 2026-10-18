import type { MjmlJson } from "#src/models/MjmlJson";

import { serializeMjml } from "#src/services/serializeMjml";
import { describe, expect, test } from "vitest";

describe(serializeMjml, () => {
  test("#41 #144 #240 a childless element is written with its own closing tag, so its sibling survives", () => {
    expect.hasAssertions();

    const column: MjmlJson = {
      attributes: {},
      children: [
        { attributes: { src: "a" }, tagName: "mj-image" },
        { attributes: {}, content: "Hi", tagName: "mj-text" },
      ],
      tagName: "mj-column",
    };
    expect(serializeMjml(column)).toBe('<mj-column><mj-image src="a"></mj-image><mj-text>Hi</mj-text></mj-column>');
  });
  test("#285 the source is the mjml element alone, with no body tag around it", () => {
    expect.hasAssertions();

    const json: MjmlJson = {
      attributes: {},
      children: [{ attributes: {}, children: [], tagName: "mj-body" }],
      tagName: "mjml",
    };
    expect(serializeMjml(json)).toBe("<mjml><mj-body></mj-body></mjml>");
  });
  test("a boolean attribute is written as its string", () => {
    expect.hasAssertions();

    expect(serializeMjml({ attributes: { "fluid-on-mobile": true }, tagName: "mj-image" })).toBe(
      '<mj-image fluid-on-mobile="true"></mj-image>',
    );
  });
});
