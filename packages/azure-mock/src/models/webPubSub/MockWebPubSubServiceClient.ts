import { MockWebPubSubDatabase } from "#src/store/MockWebPubSubDatabase";
import { getOrCreate } from "@esposter/shared";

/**
 * A minimal in-memory mock of the Azure WebPubSubServiceClient — no service and no network.
 * A group's members are the user ids added to it, and `sendToAll` reaches nobody, since no connection is held.
 */
export class MockWebPubSubServiceClient {
  group(groupName: string) {
    const getMembers = () => getOrCreate(MockWebPubSubDatabase, groupName, () => new Set<string>());
    return {
      addUser: (userId: string): Promise<void> => {
        getMembers().add(userId);
        return Promise.resolve();
      },
      removeUser: (userId: string): Promise<void> => {
        getMembers().delete(userId);
        return Promise.resolve();
      },
      sendToAll: (): Promise<void> => Promise.resolve(),
    };
  }
}
