import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import { prodEgstEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/systemTopics/prodEgstEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import {
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "prod-evgs-esposter-ae-004";
// Carries no deadLetterDestination on purpose: dead-lettering the replay subscription would write a new
// Blob into the very container it watches, and the replay would drive itself in a loop.
export const prodEvgsEsposterAe004: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ReplayDeadLetterEvent}`,
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
      resourceGroupName: prodRgEsposterAe001.name,
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      systemTopicName: prodEgstEsposterAe001.name,
    },
    {
      parent: prodEgstEsposterAe001,
      protect: true,
    },
  );
