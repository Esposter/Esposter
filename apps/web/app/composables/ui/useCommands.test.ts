// @vitest-environment nuxt
import { useCommandStore } from "@/store/ui/command";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useHotkey } from "@vuetify/v0";
import { globSync, readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";

const press = (key: string) => {
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key }));
};

describe(useCommands, () => {
  test("registers the commands and binds their shortcuts only while the surface is mounted", async () => {
    expect.hasAssertions();

    const run = vi.fn<() => void>();
    const command = { group: "group", icon: "", id: "id", run, shortcut: "x", title: "title" };
    const component = await mountSuspended(
      defineComponent({
        setup: () => {
          useCommands([command]);
          return () => h("div");
        },
      }),
    );
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);
    press("x");

    expect(commands.value).toStrictEqual([command]);
    expect(run).toHaveBeenCalledTimes(1);

    component.unmount();
    press("x");

    expect(commands.value).toStrictEqual([]);
    expect(run).toHaveBeenCalledTimes(1);
  });

  // The hotkey composable only warns on a shortcut it cannot parse and binds nothing, so every shortcut written in
  // Source is bound here: an interpolation stands in as a digit, which parses wherever a key does
  test("every shortcut in source is one the hotkey composable binds", () => {
    expect.hasAssertions();

    const unboundShortcuts: string[] = [];
    const scope = effectScope();

    for (const path of globSync("{app,shared}/**/*.{ts,vue}", { cwd: `${import.meta.dirname}/../../..` })) {
      if (path.endsWith(".test.ts")) continue;
      const code = readFileSync(`${import.meta.dirname}/../../../${path}`, "utf8");

      for (const { groups } of code.matchAll(/shortcut: (?:"(?<literal>[^"]*)"|`(?<template>[^`]*)`)/gu)) {
        const shortcut = groups?.literal ?? groups?.template?.replaceAll(/\$\{[^}]*\}/gu, "1") ?? "";
        const isActive = scope.run(() => useHotkey(shortcut, noop).isActive.value);
        if (!isActive) unboundShortcuts.push(`${path}: ${shortcut}`);
      }
    }

    scope.stop();

    expect(unboundShortcuts).toStrictEqual([]);
  });
});
