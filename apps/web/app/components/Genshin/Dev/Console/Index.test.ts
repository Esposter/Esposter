// @vitest-environment happy-dom
import type { DevCommand } from "genshin-world";

import GenshinDevConsole from "@/components/Genshin/Dev/Console/Index.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createDevRegistry } from "genshin-world";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";

describe("genshinDevConsole", () => {
  const TIME_ARGUMENTS = z.object({ hour: z.coerce.number() });
  const GIVE_ARGUMENTS = z.object({ count: z.coerce.number().int().min(1), item: z.string() });

  // The console's shortcuts register in the command store, which a plain mount has no Pinia for
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  test("Valid line runs and reports", async () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    const timeCommand: DevCommand<typeof TIME_ARGUMENTS> = {
      args: TIME_ARGUMENTS,
      argumentNames: ["hour"],
      name: "time",
      run: ({ hour }) => {
        calls.push(`time ${hour}`);
        return { ok: true, value: hour };
      },
    };
    registry.register({ commands: [timeCommand], variables: [] });
    const component = mount(GenshinDevConsole, { props: { modelValue: true, registry } });

    component.get("input").setValue("time 21");
    await component.get("form").trigger("submit");
    await flushPromises();

    expect(calls).toStrictEqual(["time 21"]);
    expect(component.findAll("li")).toHaveLength(1);
  });

  test("Bad argument runs nothing", async () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    const giveCommand: DevCommand<typeof GIVE_ARGUMENTS> = {
      args: GIVE_ARGUMENTS,
      argumentNames: ["item", "count"],
      name: "give",
      run: ({ item }) => {
        calls.push(item);
        return { ok: true, value: item };
      },
    };
    registry.register({ commands: [giveCommand], variables: [] });
    const component = mount(GenshinDevConsole, { props: { modelValue: true, registry } });

    component.get("input").setValue("give Mora lots");
    await component.get("form").trigger("submit");
    await flushPromises();

    expect(calls).toStrictEqual([]);
    expect(component.findAll("li")).toHaveLength(1);
  });
});
