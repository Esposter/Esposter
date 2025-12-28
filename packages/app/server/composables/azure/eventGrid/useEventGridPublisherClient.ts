import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";
import { useRuntimeConfig } from "nitropack/runtime";

export const useEventGridPublisherClient = () => {
  const runtimeConfig = useRuntimeConfig();
  return new EventGridPublisherClient(
    runtimeConfig.public.azure.eventGrid.topic.endpoint,
    "EventGrid",
    new AzureKeyCredential(runtimeConfig.azure.eventGrid.topic.key),
  );
};
