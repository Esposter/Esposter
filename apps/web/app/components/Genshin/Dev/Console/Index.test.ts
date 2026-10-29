// @vitest-environment happy-dom
import GenshinDevConsole from "@/components/Genshin/Dev/Console/Index.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createDevRegistry } from "genshin-world";
import { beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";

describe("genshinDevConsole", () => {
  const TIME_ARGUMENTS = z.object({ hour: z.coerce.number() });
  const GIVE_ARGUMENTS = z.object({ item: z.string(), count: z.coerce.number().int().min(1) });

  beforeEach(() => {
    window.localStorage.clear();
  });

  test("Valid line runs and reports", async () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    registry.register({
      commands: [
        {
          args: TIME_ARGUMENTS,
          name: "time",
          run: ({ hour }) => {
            calls.push(`time ${hour}`);
            return { ok: true, value: hour };
          },
        },
      ],
      variables: [],
    });
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
    registry.register({
      commands: [
        {
          args: GIVE_ARGUMENTS,
          name: "give",
          run: ({ item }) => {
            calls.push(item);
            return { ok: true, value: item };
          },
        },
      ],
      variables: [],
    });
    const component = mount(GenshinDevConsole, { props: { modelValue: true, registry } });

    component.get("input").setValue("give Mora lots");
    await component.get("form").trigger("submit");
    await flushPromises();

    expect(calls).toStrictEqual([]);
    expect(component.findAll("li")).toHaveLength(1);
  });
});
