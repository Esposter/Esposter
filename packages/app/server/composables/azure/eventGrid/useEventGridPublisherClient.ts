import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";

export const useEventGridPublisherClient = () => {
  const runtimeConfig = useRuntimeConfig();
  return new EventGridPublisherClient(
    runtimeConfig.public.azure.eventGrid.topic.endpoint,
    "EventGrid",
    new AzureKeyCredential(runtimeConfig.azure.eventGrid.topic.key),
  );
};
