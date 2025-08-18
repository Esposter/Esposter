import type { SearchMessagesInput } from "@@/server/trpc/routers/message";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { Index } from "@@/server/models/azure/search/Index";
import { getSearchUrl } from "@@/server/services/azure/search/getSearchUrl";
import { isPartitionKey } from "@@/server/services/azure/table/isPartitionKey";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

import { getOffsetPaginationData } from "../pagination/offset/getOffsetPaginationData";
// @TODO: fix this up, useSearchClient, property names for search fields
export const searchMessages = async ({
  limit = DEFAULT_READ_LIMIT,
  offset = 0,
  query,
  roomId,
}: SearchMessagesInput): Promise<OffsetPaginationData<MessageEntity>> => {
  const runtimeConfig = useRuntimeConfig();
  const endpoint = getSearchUrl();
  const apiKey = runtimeConfig.azure.search.apiKey as string;
  const indexName = Index.Messages;
  const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
  const { results } = await client.search(query || "*", {
    filter: isPartitionKey(roomId),
    orderBy: ["createdAt desc"],
    searchFields: ["message", "linkPreviewResponse"],
    skip: offset,
    top: limit + 1,
  });
  const searchedMessages: MessageEntity[] = [];
  for await (const { document } of results) searchedMessages.push(document as MessageEntity);
  return getOffsetPaginationData(searchedMessages, searchedMessages.length);
};
