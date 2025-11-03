import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";

export const eventGridPublisherClient: EventGridPublisherClient<"EventGrid"> =
  new EventGridPublisherClient<"EventGrid">(
    process.env.AZURE_EVENT_GRID_TOPIC_ENDPOINT,
    "EventGrid",
    new AzureKeyCredential(process.env.AZURE_EVENT_GRID_TOPIC_KEY),
  );
