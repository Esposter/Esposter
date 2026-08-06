import AzureEventSubscriptionRetryPolicy from "@/azure/constants/AzureEventSubscriptionRetryPolicy";
import { prodEgstEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/systemTopics/prodEgstEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "@/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { AzureContainer, AzureFunction, getBlobSubjectPrefix } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "prod-evgs-esposter-ae-007";

// Storage reports how many bytes actually landed, which is the only authority on it — the client PUTs straight
// To Azure, so nothing of ours is in the data path. This is what settles a storage quota hold into a real
// Charge against a user's allowance (/docs/platform/storage-quotas).
// Filtered to the two containers whose uploads go through a quota reserve: every other blob in the account —
// Published clones, avatars, dead-letter payloads — is accounted to nobody, so delivering it would only pay a
// Function invocation to look up a ledger row that cannot exist.
export const prodEvgsEsposterAe007: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      deadLetterDestination: {
        blobContainerName: prodstesposter001Deadletter.name,
        endpointType: "StorageBlob",
        resourceId: prodstesposter001.id,
      },
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ReconcileStorageBlob}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        // Two containers, so the prefix cannot be expressed as the single `subjectBeginsWith` — an advanced
        // Filter is the only form that takes a set
        advancedFilters: [
          {
            key: "subject",
            operatorType: "StringBeginsWith",
            values: [
              getBlobSubjectPrefix(AzureContainer.MessageAssets),
              getBlobSubjectPrefix(AzureContainer.ResourceAssets),
            ],
          },
        ],
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: ["Microsoft.Storage.BlobCreated"],
        subjectBeginsWith: "",
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
