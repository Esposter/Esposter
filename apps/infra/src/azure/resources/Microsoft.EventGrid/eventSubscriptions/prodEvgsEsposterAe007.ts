import AzureBlobCreatedEventType from "#src/azure/constants/AzureBlobCreatedEventType";
import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import { prodEgstEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/systemTopics/prodEgstEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getAzureFunctionEventSubscriptionDestination } from "#src/azure/services/getAzureFunctionEventSubscriptionDestination";
import { getStorageBlobDeadLetterDestination } from "#src/azure/services/getStorageBlobDeadLetterDestination";
import { AzureContainer, AzureFunction, getBlobSubjectPrefix } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

const eventSubscriptionName = "prod-evgs-esposter-ae-007";
export const prodEvgsEsposterAe007: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      deadLetterDestination: getStorageBlobDeadLetterDestination(prodstesposter001, prodstesposter001Deadletter),
      destination: getAzureFunctionEventSubscriptionDestination(
        AzureFunction.ReconcileStorageLedgerEntry,
        prodFuncEsposter001,
      ),
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: [AzureBlobCreatedEventType],
        subjectBeginsWith: getBlobSubjectPrefix(AzureContainer.ResourceAssets),
        subjectEndsWith: "",
      },
      resourceGroupName: prodRgEsposterAe001.name,
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      systemTopicName: prodEgstEsposterAe001.name,
    },
    { parent: prodEgstEsposterAe001, protect: true },
  );
