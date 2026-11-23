import { SITE_NAME } from "@esposter/shared";

// The response header a query's topics travel back on, one value per query in the batch
export const TOPICS_HEADER = `x-${SITE_NAME.toLowerCase()}-topics`;
// The response header a mutation's changed rows travel back on, one value per row: its procedure path, then the row's
// Key, Table and the version the write left it at
export const ROW_VERSIONS_HEADER = `x-${SITE_NAME.toLowerCase()}-row-versions`;
// Separates a header value's procedure path from its topics, and its topics from each other. Neither a path nor a topic
// Holds a space
export const TOPICS_HEADER_SEPARATOR = " ";
// Separates a topic from the columns it names, and the columns from each other. An encoded topic or column holds none
export const TOPICS_HEADER_COLUMNS_SEPARATOR = ";";
// The header a page sends with every request, naming the browser tab that made it, so an object does not send that
// Tab the echo of a write it made
export const DEVICE_ID_HEADER = `x-${SITE_NAME.toLowerCase()}-device-id`;
