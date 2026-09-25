import type { MapValue } from "#src/util/types/MapValue";
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
import type { Except } from "type-fest";

import { MOCK_QUEUE_BASE_URL } from "#src/constants";
import { NotImplementedError } from "#src/models/shared/NotImplementedError";
import { getMockQueueMessageItem } from "#src/services/queue/getMockQueueMessageItem";
import { createMockResponse } from "#src/services/shared/createMockResponse";
import { getMockSasUrl } from "#src/services/shared/getMockSasUrl";
import { MockQueueDatabase } from "#src/store/MockQueueDatabase";
import { getOrCreate } from "@esposter/shared";

/**
 * An in-memory mock of the Azure QueueClient — no emulator and no network.
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
    throw new NotImplementedError(this.clearMessages.name);
  }

  create(_options?: QueueCreateOptions): Promise<QueueCreateResponse> {
    throw new NotImplementedError(this.create.name);
  }

  createIfNotExists(): Promise<QueueCreateIfNotExistsResponse> {
    throw new NotImplementedError(this.createIfNotExists.name);
  }

  delete(): Promise<QueueDeleteResponse> {
    throw new NotImplementedError(this.delete.name);
  }

  deleteIfExists(): Promise<QueueDeleteIfExistsResponse> {
    throw new NotImplementedError(this.deleteIfExists.name);
  }

  deleteMessage(): Promise<QueueDeleteMessageResponse> {
    throw new NotImplementedError(this.deleteMessage.name);
  }

  exists(): Promise<boolean> {
    throw new NotImplementedError(this.exists.name);
  }

  generateSasStringToSign(): string {
    throw new NotImplementedError(this.generateSasStringToSign.name);
  }

  generateSasUrl(options: QueueGenerateSasUrlOptions): string {
    return getMockSasUrl(this.url, options.permissions);
  }

  generateUserDelegationSasUrl(): string {
    throw new NotImplementedError(this.generateUserDelegationSasUrl.name);
  }

  generateUserDelegationStringToSign(): string {
    throw new NotImplementedError(this.generateUserDelegationStringToSign.name);
  }

  getAccessPolicy(): Promise<QueueGetAccessPolicyResponse> {
    throw new NotImplementedError(this.getAccessPolicy.name);
  }

  getProperties(): Promise<QueueGetPropertiesResponse> {
    throw new NotImplementedError(this.getProperties.name);
  }

  getServiceProperties(): Promise<QueueServiceProperties> {
    throw new NotImplementedError(this.getServiceProperties.name);
  }

  listQueues(): AsyncIterableIterator<QueueItem> {
    throw new NotImplementedError(this.listQueues.name);
  }

  peekMessages(_options?: QueuePeekMessagesOptions): Promise<QueuePeekMessagesResponse> {
    const peekedMessageItems: PeekedMessageItem[] = this.queue.map((text) => ({
      dequeueCount: 0,
      ...getMockQueueMessageItem(text),
    }));
    return Promise.resolve({
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: peekedMessageItems },
      peekedMessageItems,
    });
  }

  receiveMessages(_options?: QueueReceiveMessageOptions): Promise<QueueReceiveMessageResponse> {
    // A receive takes the whole queue and leaves an empty one behind — swapping the map's array for a fresh
    // One rather than emptying the array in place, so nothing already holding the old one sees it drain
    const queuedTexts = this.queue;
    MockQueueDatabase.set(this.name, []);
    const receivedMessageItems: DequeuedMessageItem[] = queuedTexts.map((text) =>
      Object.assign(getMockQueueMessageItem(text), {
        dequeueCount: 1,
        nextVisibleOn: new Date(),
        popReceipt: crypto.randomUUID(),
      }),
    );
    return Promise.resolve({
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: receivedMessageItems },
      receivedMessageItems,
    });
  }

  sendMessage(messageText: string, _options?: QueueSendMessageOptions): Promise<QueueSendMessageResponse> {
    this.queue.push(messageText);
    const { expiresOn, insertedOn, messageId } = getMockQueueMessageItem(messageText);
    // Visible the moment it is inserted: the mock has no visibility timeout
    const enqueuedMessage: EnqueuedMessage = {
      expiresOn,
      insertedOn,
      messageId,
      nextVisibleOn: insertedOn,
      popReceipt: crypto.randomUUID(),
    };
    const enqueuedMessages = [enqueuedMessage];
    return Promise.resolve({
      _response: { ...createMockResponse(200, this.url), bodyAsText: "", parsedBody: enqueuedMessages },
      ...enqueuedMessage,
    });
  }

  setAccessPolicy(_identifiers?: SignedIdentifier[]): Promise<QueueSetAccessPolicyResponse> {
    throw new NotImplementedError(this.setAccessPolicy.name);
  }

  setMetadata(): Promise<QueueSetMetadataResponse> {
    throw new NotImplementedError(this.setMetadata.name);
  }

  updateMessage(): Promise<QueueUpdateMessageResponse> {
    throw new NotImplementedError(this.updateMessage.name);
  }
}
