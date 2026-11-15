import { SITE_NAME } from "@esposter/shared";

// The response header a query's topics travel back on, one value per query in the batch
export const TOPICS_HEADER = `x-${SITE_NAME.toLowerCase()}-topics`;
// Separates a header value's procedure path from its topics, and its topics from each other. Neither a path nor a topic
// Holds a space
export const TOPICS_HEADER_SEPARATOR = " ";
