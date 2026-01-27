import type {
  DequeuedMessageItem,
  EnqueuedMessage,
  PeekedMessageItem,
  QueueClearMessagesResponse,
  QueueClient,
  QueueCreateIfNotExistsResponse,
  QueueCreateOptions,
  QueueCreateResponse,
  QueueDeleteIfExistsResponse,
  QueueDeleteMessageResponse,
  QueueDeleteResponse,
  QueueGetAccessPolicyResponse,
  QueueGetPropertiesResponse,
  QueueItem,
  QueuePeekMessagesOptions,
  QueuePeekMessagesResponse,
  QueueReceiveMessageOptions,
  QueueReceiveMessageResponse,
  QueueSendMessageOptions,
  QueueSendMessageResponse,
  QueueServiceProperties,
  QueueSetAccessPolicyResponse,
  QueueSetMetadataResponse,
  QueueUpdateMessageResponse,
  SignedIdentifier,
} from "@azure/storage-queue";
import type { MapValue } from "@esposter/shared";
import type { Except } from "type-fest";

import { toWebResourceLike } from "@/services/container/toWebResourceLike";
import { MockQueueDatabase } from "@/store/MockQueueDatabase";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";
/**
 * An in-memory mock of the Azure QueueClient.
 * It uses a Map to simulate queue storage and correctly implements the QueueClient interface.
 *
 * @example
 * const mockQueueClient = new MockQueueClient("", "hello world");
 * await mockQueueClient.createIfNotExists();
 * await mockQueueClient.sendMessage("hello world");
 * const messages = await mockQueueClient.peekMessages();
 */
export class MockQueueClient implements Except<QueueClient, "accountName"> {
  connectionString: string;
  name: string;
  url: string;

  get queue(): MapValue<typeof MockQueueDatabase> {
    let messages = MockQueueDatabase.get(this.name);
    if (!messages) {
      messages = [];
      MockQueueDatabase.set(this.name, messages);
    }
    return messages;
  }

  constructor(connectionString: string, queueName: string) {
    this.connectionString = connectionString;
    this.name = queueName;
    this.url = `https://mockaccount.queue.core.windows.net/${this.name}`;
  }

  clearMessages(): Promise<QueueClearMessagesResponse> {
    throw new Error("Method not implemented.");
  }

  create(_options?: QueueCreateOptions): Promise<QueueCreateResponse> {
    throw new Error("Method not implemented.");
  }

  createIfNotExists(): Promise<QueueCreateIfNotExistsResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<QueueDeleteResponse> {
    throw new Error("Method not implemented.");
  }

  deleteIfExists(): Promise<QueueDeleteIfExistsResponse> {
    throw new Error("Method not implemented.");
  }

  deleteMessage(): Promise<QueueDeleteMessageResponse> {
    throw new Error("Method not implemented.");
  }

  exists(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  generateSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateSasUrl(): string {
    throw new Error("Method not implemented.");
  }

  generateUserDelegationSasUrl(): string {
    throw new Error("Method not implemented.");
  }

  generateUserDelegationStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  getAccessPolicy(): Promise<QueueGetAccessPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  getProperties(): Promise<QueueGetPropertiesResponse> {
    throw new Error("Method not implemented.");
  }

  getServiceProperties(): Promise<QueueServiceProperties> {
    throw new Error("Method not implemented.");
  }

  listQueues(): AsyncIterableIterator<QueueItem> {
    throw new Error("Method not implemented.");
  }

  peekMessages(_options?: QueuePeekMessagesOptions): Promise<QueuePeekMessagesResponse> {
    const peekedMessageItems: PeekedMessageItem[] = this.queue.map((text) => ({
      dequeueCount: 0,
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      insertedOn: new Date(),
      messageId: crypto.randomUUID(),
      messageText: text,
    }));
    return Promise.resolve({
      _response: {
        bodyAsText: "",
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedBody: peekedMessageItems,
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: this.url })),
        status: 200,
      },
      peekedMessageItems,
    });
  }

  receiveMessages(_options?: QueueReceiveMessageOptions): Promise<QueueReceiveMessageResponse> {
    const receivedMessageItems: DequeuedMessageItem[] = this.queue.splice(0).map((text) => ({
      dequeueCount: 1,
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      insertedOn: new Date(),
      messageId: crypto.randomUUID(),
      messageText: text,
      nextVisibleOn: new Date(),
      popReceipt: crypto.randomUUID(),
    }));
    return Promise.resolve({
      _response: {
        bodyAsText: "",
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedBody: receivedMessageItems,
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: this.url })),
        status: 200,
      },
      receivedMessageItems,
    });
  }

  sendMessage(messageText: string, _options?: QueueSendMessageOptions): Promise<QueueSendMessageResponse> {
    this.queue.push(messageText);
    const now = new Date();
    const expiresOn = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const insertedOn = now;
    const messageId = crypto.randomUUID();
    const nextVisibleOn = now;
    const popReceipt = crypto.randomUUID();
    const enqueuedMessages: EnqueuedMessage[] = [
      {
        expiresOn,
        insertedOn,
        messageId,
        nextVisibleOn,
        popReceipt,
      },
    ];
    return Promise.resolve({
      _response: {
        bodyAsText: "",
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedBody: enqueuedMessages,
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: this.url })),
        status: 200,
      },
      expiresOn,
      insertedOn,
      messageId,
      nextVisibleOn,
      popReceipt,
    });
  }

  setAccessPolicy(_identifiers?: SignedIdentifier[]): Promise<QueueSetAccessPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  setMetadata(): Promise<QueueSetMetadataResponse> {
    throw new Error("Method not implemented.");
  }

  updateMessage(): Promise<QueueUpdateMessageResponse> {
    throw new Error("Method not implemented.");
  }
}
