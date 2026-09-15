import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { describe, expect, test } from "vitest";

describe(getComponentName, () => {
  test.each([
    ["a component at the root", "Item.vue", "Item"],
    ["the folders prefixing the file name", "Message/List/Item.vue", "MessageListItem"],
    ["a file name repeating its folder", "Message/Room/RoomHeader.vue", "MessageRoomHeader"],
    ["a file name repeating two folders", "Message/Room/MessageRoomHeader.vue", "MessageRoomHeader"],
    ["a file named after its folder", "Item/Item.vue", "Item"],
    ["an index file", "Message/Type/Index.vue", "MessageType"],
  ])("derives %s", (_, componentPath, name) => {
    expect.hasAssertions();

    expect(getComponentName(componentPath)).toBe(name);
  });
});
