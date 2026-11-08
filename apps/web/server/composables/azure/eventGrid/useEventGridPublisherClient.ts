import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";

export const useEventGridPublisherClient = () =>
  new EventGridPublisherClient(
    process.env.AZURE_EVENT_GRID_TOPIC_ENDPOINT,
    "EventGrid",
    new AzureKeyCredential(process.env.AZURE_EVENT_GRID_TOPIC_KEY),
  );
