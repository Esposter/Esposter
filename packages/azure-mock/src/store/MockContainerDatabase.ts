import { MockContainerCreatedOnDatabase } from "@/store/MockContainerCreatedOnDatabase";

// Clearing the blobs drops their creation instants too — a test resets by clearing this map, and a createdOn
// That outlived its blob re-dates the next blob seeded under the same container/name key.
class MockContainerDatabaseMap extends Map<string, Map<string, Buffer>> {
  override clear(): void {
    super.clear();
    MockContainerCreatedOnDatabase.clear();
  }
}

// Map<container, Map<name, blob>>
export const MockContainerDatabase: Map<string, Map<string, Buffer>> = new MockContainerDatabaseMap();
