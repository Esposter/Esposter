// @vitest-environment nuxt
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { Router } from "vue-router";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { useInputStore } from "@/store/message/input";
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

    const slashCommandStore = useSlashCommandStore();
    const { activeParameterNames, focusedIndex, parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    setPendingSlashCommand(mockSlashCommand);

    expect(pendingSlashCommand.value).toStrictEqual(mockSlashCommand);
    expect(parameterValues.value).toStrictEqual({ [parameter1]: "", [parameter2]: "", [parameter3]: "" });
    expect(activeParameterNames.value).toStrictEqual([parameter1, parameter2, parameter3]);
    expect(focusedIndex.value).toBe(0);
  });

  test("parses single parameter", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    const value = "";
    setPendingSlashCommand(mockSlashCommand, `${parameter1}${ID_SEPARATOR}${value}`);

    expect(parameterValues.value).toStrictEqual({ [parameter1]: value });
    expect(trailingMessage.value).toBe("");
  });

  test("parses multiple parameters in order", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { parameterValues, trailingMessage } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    const parameterValue1 = "";
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: "",
    });
    expect(trailingMessage.value).toBe("");
  });

  test("parses parameters with separators in values", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { parameterValues } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    const parameterValue1 = `a${ID_SEPARATOR}b`;
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: "",
    });
  });

  test("parses parameters with spaces in values", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { parameterValues } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    const parameterValue1 = "a b";
    const parameterValue2 = " ";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value).toStrictEqual({
      [parameter1]: parameterValue1,
      [parameter2]: "",
    });
  });

  test("parses parameters out of order (finding earliest next parameter)", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { parameterValues } = storeToRefs(slashCommandStore);
    const { setPendingSlashCommand } = slashCommandStore;
    const parameterValue1 = "";
    const parameterValue2 = " ";
    const parameterValue3 = "a";
    setPendingSlashCommand(
      mockSlashCommand,
      `${parameter1}${ID_SEPARATOR}${parameterValue1} ${parameter3}${ID_SEPARATOR}${parameterValue3} ${parameter2}${ID_SEPARATOR}${parameterValue2}`,
    );

    expect(parameterValues.value[parameter1]).toBe(parameterValue1);
    expect(parameterValues.value[parameter3]).toBe(parameterValue3);
    expect(parameterValues.value[parameter2]).toBe("");
  });

  // Collapsing is the one thing that turns the parameter chips back into text the composer can send, so the
  // Round trip — parse text into parameters, collapse them back — has to land on the text it started from
  test("collapses filled parameters and the trailing message back into the input", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { collapseToText, setPendingSlashCommand } = slashCommandStore;
    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    const text = `${parameter1}${ID_SEPARATOR}value1 ${parameter2}${ID_SEPARATOR}value2 trailing`;
    setPendingSlashCommand(mockSlashCommand, text);
    collapseToText();

    expect(input.value).toBe(`/${SlashCommandType.Me} ${text}`);
  });

  // A parameter dropped from the chips leaves no value behind, so collapsing writes only what is still filled in
  test("leaves a deleted parameter out of the collapsed text", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { collapseToText, deleteParameter, setPendingSlashCommand } = slashCommandStore;
    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    setPendingSlashCommand(mockSlashCommand, `${parameter1}${ID_SEPARATOR}value1 ${parameter2}${ID_SEPARATOR}value2`);
    deleteParameter(parameter1);
    collapseToText();

    expect(input.value).toBe(`/${SlashCommandType.Me} ${parameter2}${ID_SEPARATOR}value2`);
  });

  test("clears store correctly", () => {
    expect.hasAssertions();

    const slashCommandStore = useSlashCommandStore();
    const { activeParameterNames, focusedIndex, parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
    const { clearPendingSlashCommand, setPendingSlashCommand } = slashCommandStore;
    setPendingSlashCommand(mockSlashCommand, `${parameter1}${ID_SEPARATOR}`);
    clearPendingSlashCommand();

    expect(pendingSlashCommand.value).toBeUndefined();
    expect(parameterValues.value).toStrictEqual({});
    expect(activeParameterNames.value).toStrictEqual([]);
    expect(focusedIndex.value).toBe(0);
  });
});
