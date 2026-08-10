import AzureEventSubscriptionRetryPolicy from "@/azure/constants/AzureEventSubscriptionRetryPolicy";
import { devEgstEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/systemTopics/devEgstEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import {
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-004";
// Carries no deadLetterDestination on purpose: dead-lettering the replay subscription would write a new
// Blob into the very container it watches, and the replay would drive itself in a loop.
export const devEvgsEsposterAe004: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ReplayDeadLetterEvent}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        // The archived and quarantined copies live in the same container, so without these exclusions every
        // Blob the replay writes would immediately retrigger the replay that wrote it.
        advancedFilters: [
          {
            key: "subject",
            operatorType: "StringNotBeginsWith",
            values: [
              `${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${DEAD_LETTER_ARCHIVED_PREFIX}`,
              `${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${DEAD_LETTER_QUARANTINE_PREFIX}`,
            ],
          },
        ],
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: ["Microsoft.Storage.BlobCreated"],
        subjectBeginsWith: DEAD_LETTER_BLOB_SUBJECT_PREFIX,
        subjectEndsWith: "",
      },
      resourceGroupName: devRgEsposterAe001.name,
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      systemTopicName: devEgstEsposterAe001.name,
    },
    {
      parent: devEgstEsposterAe001,
      protect: true,
    },
  );
