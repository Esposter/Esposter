/**
 * A minimal mock of the Azure WebPubSubServiceClient for testing purposes.
 * Only implements `group().sendToAll` — the only method used in azure-functions tests.
 */
export class MockWebPubSubServiceClient {
  group(_groupName: string): { sendToAll: () => Promise<void> } {
    return { sendToAll: () => Promise.resolve() };
  }
}
