import { MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";
import { MockContainerBlobMetadataDatabase } from "#src/store/MockContainerBlobMetadataDatabase";

// Clearing the blobs drops everything keyed to them — a test resets by clearing this map, and a createdOn or a
// Metadata record that outlived its blob re-dates or re-tags the next blob seeded under the same key.
class MockContainerDatabaseMap extends Map<string, Map<string, Buffer>> {
  override clear(): void {
    super.clear();
    MockContainerBlobDatesDatabase.clear();
    MockContainerBlobMetadataDatabase.clear();
  }
}
// Map<container, Map<name, blob>>
export const MockContainerDatabase: Map<string, Map<string, Buffer>> = new MockContainerDatabaseMap();
