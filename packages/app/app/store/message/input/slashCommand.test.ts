import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { ID_SEPARATOR } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSlashCommandStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const description = "description";
  const icon = "icon";
  const p1 = "p1";
  const p2 = "p2";
  const p3 = "p3";
  const title = "title";
  const mockSlashCommand = {
    description,
    icon,
    parameters: [
      { description, isRequired: true, name: p1 },
      { description, isRequired: false, name: p2 },
      { description, isRequired: false, name: p3 },
    ],
    title,
    type: SlashCommandType.Me,
  };

  test("initializes correctly without text", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { activeParameterNames, focusedIndex, parameterValues, pendingSlashCommand } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    setPendingSlashCommand(mockSlashCommand);

    expect(pendingSlashCommand.value).toStrictEqual(mockSlashCommand);
    expect(parameterValues.value).toStrictEqual({ [p1]: "", [p2]: "", [p3]: "" });
    expect(activeParameterNames.value).toStrictEqual([p1, p2, p3]);
    expect(focusedIndex.value).toBe(0);
  });

  test("parses single parameter", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const value = "";
    setPendingSlashCommand(mockSlashCommand, `${p1}${ID_SEPARATOR}${value}`);

    expect(parameterValues.value).toStrictEqual({ [p1]: value });
    expect(trailingMessage.value).toBe("");
  });

  test("parses multiple parameters in order", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const v1 = "";
    const v2 = " ";
    setPendingSlashCommand(mockSlashCommand, `${p1}${ID_SEPARATOR}${v1} ${p2}${ID_SEPARATOR}${v2}`);

    expect(parameterValues.value).toStrictEqual({ [p1]: v1, [p2]: v2 });
    expect(trailingMessage.value).toBe("");
  });

  test("parses parameters with separators in values", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const v1 = `a${ID_SEPARATOR}b`;
    const v2 = " ";
    setPendingSlashCommand(mockSlashCommand, `${p1}${ID_SEPARATOR}${v1} ${p2}${ID_SEPARATOR}${v2}`);

    expect(parameterValues.value).toStrictEqual({ [p1]: v1, [p2]: v2 });
  });

  test("parses parameters with spaces in values", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const v1 = "a b";
    const v2 = " ";
    setPendingSlashCommand(mockSlashCommand, `${p1}${ID_SEPARATOR}${v1} ${p2}${ID_SEPARATOR}${v2}`);

    expect(parameterValues.value).toStrictEqual({ [p1]: v1, [p2]: v2 });
  });

  test("parses parameters out of order (finding earliest next parameter)", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const v1 = "";
    const v2 = " ";
    const v3 = "a";
    setPendingSlashCommand(
      mockSlashCommand,
      `${p1}${ID_SEPARATOR}${v1} ${p3}${ID_SEPARATOR}${v3} ${p2}${ID_SEPARATOR}${v2}`,
    );

    expect(parameterValues.value[p1]).toBe(v1);
    expect(parameterValues.value[p3]).toBe(`${v3} ${p2}${ID_SEPARATOR}${v2}`);
    expect(parameterValues.value[p2]).toBeUndefined();
  });

  test("clears store correctly", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { activeParameterNames, focusedIndex, parameterValues, pendingSlashCommand } = storeToRefs(store);
    const { clearPendingSlashCommand, setPendingSlashCommand } = store;
    setPendingSlashCommand(mockSlashCommand, `${p1}${ID_SEPARATOR}`);
    clearPendingSlashCommand();

    expect(pendingSlashCommand.value).toBeNull();
    expect(parameterValues.value).toStrictEqual({});
    expect(activeParameterNames.value).toStrictEqual([]);
    expect(focusedIndex.value).toBe(0);
  });
});
