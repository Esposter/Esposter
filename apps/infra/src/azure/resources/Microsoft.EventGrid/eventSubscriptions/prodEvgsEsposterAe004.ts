import AzureBlobCreatedEventType from "#src/azure/constants/AzureBlobCreatedEventType";
import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import { prodEgstEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/systemTopics/prodEgstEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getAzureFunctionEventSubscriptionDestination } from "#src/azure/services/getAzureFunctionEventSubscriptionDestination";
import {
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

const eventSubscriptionName = "prod-evgs-esposter-ae-004";
export const prodEvgsEsposterAe004: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      destination: getAzureFunctionEventSubscriptionDestination(
        AzureFunction.ReplayDeadLetterEvent,
        prodFuncEsposter001,
      ),
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
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
        includedEventTypes: [AzureBlobCreatedEventType],
        subjectBeginsWith: DEAD_LETTER_BLOB_SUBJECT_PREFIX,
        subjectEndsWith: "",
      },
      resourceGroupName: prodRgEsposterAe001.name,
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      systemTopicName: prodEgstEsposterAe001.name,
    },
    { parent: prodEgstEsposterAe001, protect: true },
  );
