import AzureBlobCreatedEventType from "#src/azure/constants/AzureBlobCreatedEventType";
import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import { devEgstEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/systemTopics/devEgstEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getAzureFunctionEventSubscriptionDestination } from "#src/azure/services/getAzureFunctionEventSubscriptionDestination";
import {
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

const eventSubscriptionName = "dev-evgs-esposter-ae-004";
export const devEvgsEsposterAe004: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      destination: getAzureFunctionEventSubscriptionDestination(
        AzureFunction.ReplayDeadLetterEvent,
        devFuncEsposter001,
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
      resourceGroupName: devRgEsposterAe001.name,
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      systemTopicName: devEgstEsposterAe001.name,
    },
    { parent: devEgstEsposterAe001, protect: true },
  );
