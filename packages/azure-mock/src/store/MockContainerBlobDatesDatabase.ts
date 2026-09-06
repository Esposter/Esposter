import type { MockBlobDates } from "#src/models/container/MockBlobDates";

// Map<`${container}/${blob}`, dates> — kept beside the content map rather than inside it so seeding content
// Straight into MockContainerDatabase keeps working.
export const MockContainerBlobDatesDatabase: Map<string, MockBlobDates> = new Map<string, MockBlobDates>();
