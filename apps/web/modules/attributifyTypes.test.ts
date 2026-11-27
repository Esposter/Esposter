import { createAttributifyTemplate, getAttributifyNames } from "#modules/attributifyTypes";
import unoConfig from "#uno.config";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createGenerator } from "unocss";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(getAttributifyNames, () => {
  test("declares a utility that generates CSS in both spellings, and a misspelled one in neither", async () => {
    expect.hasAssertions();

    const generator = await createGenerator(unoConfig);
    const code = `<template><div flex-col flx-col hover:bg="border" /></template>`;
    const tokens = new Set<string>();
    await generator.applyExtractors(code, "a.vue", tokens);

    const names = await getAttributifyNames(generator, tokens);

    expect(names).toStrictEqual(["flex-col", "flexCol", "hover:bg"]);
  });
});

describe(createAttributifyTemplate, () => {
  const name = `"flex-col"`;
  const withName = `<template><div flex-col /></template>`;
  const withoutName = `<template><div flex /></template>`;
  let directory = "";

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "attributify-"));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
    await rm(`${directory}-sibling`, { force: true, recursive: true });
  });

  test("declares a utility a reported edit adds, and drops it once its file is removed", async () => {
    expect.hasAssertions();

    const template = createAttributifyTemplate(directory, createGenerator(unoConfig));
    const path = join(directory, "a.vue");
    await writeFile(path, withoutName);

    await expect(template.getContents()).resolves.not.toContain(name);

    await writeFile(path, withName);
    template.onWatch("change", path);

    await expect(template.getContents()).resolves.toContain(name);

    await rm(path);
    template.onWatch("unlink", path);

    await expect(template.getContents()).resolves.not.toContain(name);
  });

  test("keeps a utility while another file still holds it", async () => {
    expect.hasAssertions();

    const template = createAttributifyTemplate(directory, createGenerator(unoConfig));
    const path = join(directory, "a.vue");
    await writeFile(path, withName);
    await writeFile(join(directory, "b.vue"), withName);
    await template.getContents();
    await writeFile(path, withoutName);
    template.onWatch("change", path);

    await expect(template.getContents()).resolves.toContain(name);
  });

  test("declares a utility an edit adds to a file whose own name begins with two dots", async () => {
    expect.hasAssertions();

    const template = createAttributifyTemplate(directory, createGenerator(unoConfig));
    await template.getContents();
    const path = join(directory, "..Card.vue");
    await writeFile(path, withName);
    template.onWatch("add", path);

    await expect(template.getContents()).resolves.toContain(name);
  });

  test("ignores a file outside the directory whose path shares its prefix", async () => {
    expect.hasAssertions();

    const template = createAttributifyTemplate(directory, createGenerator(unoConfig));
    await template.getContents();
    const siblingPath = join(`${directory}-sibling`, "a.vue");
    await mkdir(`${directory}-sibling`);
    await writeFile(siblingPath, withName);
    template.onWatch("add", siblingPath);

    await expect(template.getContents()).resolves.not.toContain(name);
  });
});
