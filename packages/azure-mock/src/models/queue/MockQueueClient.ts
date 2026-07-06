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
  QueueGenerateSasUrlOptions,
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

import { MOCK_QUEUE_BASE_URL } from "@/constants";
import { createMockResponse } from "@/services/createMockResponse";
import { getMockSasUrl } from "@/services/getMockSasUrl";
import { MockQueueDatabase } from "@/store/MockQueueDatabase";
import { MAX_QUEUE_VISIBILITY_TIMEOUT_MS } from "@esposter/db";
import { getOrCreate } from "@esposter/shared";
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
    return getOrCreate(MockQueueDatabase, this.name, () => []);
  }

  constructor(connectionString: string, queueName: string) {
    this.connectionString = connectionString;
    this.name = queueName;
    this.url = `${MOCK_QUEUE_BASE_URL}/${this.name}`;
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

  generateSasUrl(options: QueueGenerateSasUrlOptions): string {
    return getMockSasUrl(this.url, options.permissions);
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
      expiresOn: new Date(Date.now() + MAX_QUEUE_VISIBILITY_TIMEOUT_MS),
      insertedOn: new Date(),
      messageId: crypto.randomUUID(),
      messageText: text,
    }));
    return Promise.resolve({
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: peekedMessageItems },
      peekedMessageItems,
    });
  }

  receiveMessages(_options?: QueueReceiveMessageOptions): Promise<QueueReceiveMessageResponse> {
    const receivedMessageItems: DequeuedMessageItem[] = this.queue.splice(0).map((text) => ({
      dequeueCount: 1,
      expiresOn: new Date(Date.now() + MAX_QUEUE_VISIBILITY_TIMEOUT_MS),
      insertedOn: new Date(),
      messageId: crypto.randomUUID(),
      messageText: text,
      nextVisibleOn: new Date(),
      popReceipt: crypto.randomUUID(),
    }));
    return Promise.resolve({
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: receivedMessageItems },
      receivedMessageItems,
    });
  }

  sendMessage(messageText: string, _options?: QueueSendMessageOptions): Promise<QueueSendMessageResponse> {
    this.queue.push(messageText);
    const now = new Date();
    const expiresOn = new Date(now.getTime() + MAX_QUEUE_VISIBILITY_TIMEOUT_MS);
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
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: enqueuedMessages },
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
