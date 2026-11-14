// @vitest-environment nuxt
import MessageModelMessageInputSlashCommandParameters from "@/components/Message/Model/Message/Input/SlashCommandParameters/Index.vue";
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { COMMAND_INPUT_INDEX } from "@/services/message/slashCommands/constants";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useInputStore } from "@/store/message/input";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelMessageInputSlashCommandParameters", () => {
  const roomId = v7();
  // The Me command's one parameter is required; its chip is the input a test types the value into
  const parameterName = "message";

  // A room's store is keyed by the room in the route, which mounting resets, so the room is set after the mount. The
  // Row is attached to the document, since a keystroke in a detached tree never reaches the window's listeners
  const mountWithPendingCommand = async () => {
    const component = await mountSuspended(MessageModelMessageInputSlashCommandParameters, { attachTo: document.body });
    setCurrentRoomId(roomId);
    const slashCommandStore = useSlashCommandStore();
    const { setPendingSlashCommand } = slashCommandStore;
    setPendingSlashCommand(SlashCommandDefinitionMap[SlashCommandType.Me]);
    await flushPromises();
    return component;
  };

  test("backspace in a command name that still has text deletes a character and keeps the command", async () => {
    expect.hasAssertions();

    const component = await mountWithPendingCommand();
    const slashCommandStore = useSlashCommandStore();
    const { focusedIndex, pendingSlashCommand } = storeToRefs(slashCommandStore);
    focusedIndex.value = COMMAND_INPUT_INDEX;
    await flushPromises();
    await component.get('input[aria-label="Command"]').trigger("keydown", { key: "Backspace" });
    await flushPromises();
    expect(pendingSlashCommand.value?.type).toBe(SlashCommandType.Me);
  });

  test("escape pressed outside the row leaves the pending command where it is", async () => {
    expect.hasAssertions();

    await mountWithPendingCommand();
    const slashCommandStore = useSlashCommandStore();
    const { pendingSlashCommand } = storeToRefs(slashCommandStore);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();
    expect(pendingSlashCommand.value?.type).toBe(SlashCommandType.Me);
  });

  test("escape pressed inside the row collapses the command to text", async () => {
    expect.hasAssertions();

    const component = await mountWithPendingCommand();
    const slashCommandStore = useSlashCommandStore();
    const { pendingSlashCommand } = storeToRefs(slashCommandStore);
    await component.get(`input[aria-label="${parameterName}"]`).trigger("keydown", { key: "Escape" });
    await flushPromises();
    expect(pendingSlashCommand.value).toBeUndefined();
    const inputStore = useInputStore();
    expect(inputStore.input).toBe(`/${SlashCommandType.Me}`);
  });
});
