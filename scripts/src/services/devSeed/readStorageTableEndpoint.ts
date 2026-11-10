const TABLE_ENDPOINT_KEY = "TableEndpoint=";

// The table endpoint a storage connection string names, or undefined when it names none
export const readStorageTableEndpoint = (storageConnectionString: string): string | undefined =>
  storageConnectionString
    .split(";")
    .find((part) => part.startsWith(TABLE_ENDPOINT_KEY))
    ?.slice(TABLE_ENDPOINT_KEY.length);
