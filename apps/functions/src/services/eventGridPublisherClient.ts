import { EventGridPublisherClient } from "@azure/eventgrid";
import { DefaultAzureCredential } from "@azure/identity";

export const eventGridPublisherClient: EventGridPublisherClient<"EventGrid"> =
  new EventGridPublisherClient<"EventGrid">(
    process.env.AZURE_EVENT_GRID_TOPIC_ENDPOINT,
    "EventGrid",
    new DefaultAzureCredential(),
  );
