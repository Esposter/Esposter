import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { createAzureOperationData } from "@/services/shared/pagination/createAzureOperationData";
import { beforeEach, describe, expect, test } from "vitest";

describe("createAzureOperationData", () => {
  let azureOperationData: ReturnType<typeof createAzureOperationData<MessageEntity, AzureEntityType.Message>>;

  beforeEach(() => {
    azureOperationData = createAzureOperationData(ref<MessageEntity[]>([]), AzureEntityType.Message);
  });

  test("pushes", () => {
    expect.hasAssertions();

    const { messageList, pushMessageList } = azureOperationData;

    expect(messageList.value).toHaveLength(0);

    const newMessage = new MessageEntity();
    pushMessageList(newMessage);

    expect(messageList.value).toHaveLength(1);
    expect(messageList.value[0]).toStrictEqual(newMessage);
  });

  test("creates", () => {
    expect.hasAssertions();

    const { createMessage, messageList } = azureOperationData;

    expect(messageList.value).toHaveLength(0);

    const newMessage = new MessageEntity();
    createMessage(newMessage);

    expect(messageList.value).toHaveLength(1);
    expect(messageList.value[0]).toStrictEqual(newMessage);
  });

  test("updates", () => {
    expect.hasAssertions();

    const { createMessage, messageList, updateMessage } = azureOperationData;
    const newMessage = new MessageEntity();
    const updatedMessage = "updatedMessage";
    createMessage(newMessage);

    expect(messageList.value[0].message).not.toStrictEqual(updatedMessage);

    updateMessage(Object.assign({}, newMessage, { message: updatedMessage }));

    expect(messageList.value[0].message).toStrictEqual(updatedMessage);
  });

  test("deletes", () => {
    expect.hasAssertions();

    const { createMessage, deleteMessage, messageList } = azureOperationData;
    const newMessage = new MessageEntity();
    createMessage(newMessage);

    expect(messageList.value).toHaveLength(1);

    deleteMessage(newMessage);

    expect(messageList.value).toHaveLength(0);
  });
});
