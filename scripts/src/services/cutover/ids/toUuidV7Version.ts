import { UUID_VERSION_INDEX } from "#src/services/cutover/constants";

// A UUIDv4 with its version digit set to 7. Its variant bits already match, so it is a valid UUIDv7, and two distinct
// UUIDv4s stay distinct, since they differ outside that digit. Any other UUID is returned as it is
export const toUuidV7Version = (uuid: string): string =>
  uuid.charAt(UUID_VERSION_INDEX) === "4"
    ? `${uuid.slice(0, UUID_VERSION_INDEX)}7${uuid.slice(UUID_VERSION_INDEX + 1)}`
    : uuid;
