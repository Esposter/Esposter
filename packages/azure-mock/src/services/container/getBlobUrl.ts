import { MOCK_BLOB_BASE_URL } from "@/constants";
// Percent-encoded per path segment, as the real SDK builds it. Production takes every copy source and batch-delete
// Target from a client's own `url`, so a raw interpolation here would address a name truncated at the first `#` or
// `?` — both legal in a filename — and the escaping the real client guarantees would go unexercised by the mock.
export const getBlobUrl = (containerName: string, blobName: string) =>
  `${MOCK_BLOB_BASE_URL}/${containerName}/${blobName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
