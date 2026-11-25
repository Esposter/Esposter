import { getAttributifyNames } from "#modules/attributifyTypes";
import unoConfig from "#uno.config";
import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

describe(getAttributifyNames, () => {
  test("declares a utility that generates CSS in both spellings, and a misspelled one in neither", async () => {
    expect.hasAssertions();

    const generator = await createGenerator(unoConfig);
    const code = `<template><div flex-col flx-col hover:bg="border" /></template>`;

    const names = await getAttributifyNames(generator, [{ code, id: "Example.vue" }]);

    expect(names).toStrictEqual(["flex-col", "flexCol", "hover:bg"]);
  });
});
