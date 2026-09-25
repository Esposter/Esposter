// @vitest-environment nuxt
import { useCommandStore } from "@/store/ui/command";
import { mountSuspended } from "@nuxt/test-utils/runtime";
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
});
