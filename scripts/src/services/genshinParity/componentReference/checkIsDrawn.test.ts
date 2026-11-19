import { checkIsDrawn } from "#src/services/genshinParity/componentReference/checkIsDrawn";
import { describe, expect, test } from "vitest";

describe(checkIsDrawn, () => {
  test.each([
    ["a native element", "<template>\n  <div />\n</template>", true],
    ["only a child component", "<template>\n  <Child />\n</template>", false],
    ["only a kebab-case child component", "<template>\n  <my-child />\n</template>", false],
    ["only a slot", "<template>\n  <slot />\n</template>", false],
    ["no template", '<script setup lang="ts"></script>', false],
  ])("%s", (_description, source, expected) => {
    expect.hasAssertions();

    expect(checkIsDrawn(source)).toBe(expected);
  });
});
