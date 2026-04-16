// @vitest-environment nuxt
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { Router } from "vue-router";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { ID_SEPARATOR } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useSlashCommandStore, () => {
  let router: Router;

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = crypto.randomUUID();
  });

  const description = "description";
  const icon = "icon";
  const parameter1 = "parameter1";
  const parameter2 = "parameter2";
  const parameter3 = "parameter3";
  const title = "title";
  const mockSlashCommand: SlashCommand = {
    description,
    icon,
    parameters: [
      { description, isRequired: true, name: parameter1 },
      { description, isRequired: false, name: parameter2 },
      { description, isRequired: false, name: parameter3 },
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
    expect(parameterValues.value).toStrictEqual({ [parameter1]: "", [parameter2]: "", [parameter3]: "" });
    expect(activeParameterNames.value).toStrictEqual([parameter1, parameter2, parameter3]);
    expect(focusedIndex.value).toBe(0);
  });

  test("parses single parameter", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const value = "";
    setPendingSlashCommand(mockSlashCommand, `${parameter1}${ID_SEPARATOR}${value}`);

    expect(parameterValues.value).toStrictEqual({ [parameter1]: value });
    expect(trailingMessage.value).toBe("");
  });

  test("parses multiple parameters in order", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const parameterValue1 = "";
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: parameterValue2.trim(),
    });
    expect(trailingMessage.value).toBe("");
  });

  test("parses parameters with separators in values", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const parameterValue1 = `a${ID_SEPARATOR}b`;
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: parameterValue2.trim(),
    });
  });

  test("parses parameters with spaces in values", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const parameterValue1 = "a b";
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: parameterValue2.trim(),
    });
  });

  test("parses parameters out of order (finding earliest next parameter)", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { parameterValues } = storeToRefs(store);
    const { setPendingSlashCommand } = store;
    const parameterValue1 = "";
    const parameterValue2 = " ";
    const parameterValue3 = "a";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter3}${ID_SEPARATOR}${parameterValue3} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value[parameter1]).toBe(parameterValue1);
    expect(parameterValues.value[parameter3]).toBe(parameterValue3);
    expect(parameterValues.value[parameter2]).toBe(parameterValue2.trim());
  });

  test("clears store correctly", () => {
    expect.hasAssertions();

    const store = useSlashCommandStore();
    const { activeParameterNames, focusedIndex, parameterValues, pendingSlashCommand } = storeToRefs(store);
    const { clearPendingSlashCommand, setPendingSlashCommand } = store;
    setPendingSlashCommand(mockSlashCommand, `${parameter1}${ID_SEPARATOR}`);
    clearPendingSlashCommand();

    expect(pendingSlashCommand.value).toBeNull();
    expect(parameterValues.value).toStrictEqual({});
    expect(activeParameterNames.value).toStrictEqual([]);
    expect(focusedIndex.value).toBe(0);
  });
});
