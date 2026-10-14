import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { AzureTable } from "@esposter/db-schema";

export const getMessageTableClients = () =>
  Promise.all([useTableClient(AzureTable.Messages), useTableClient(AzureTable.MessagesAscending)]);
