import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import { devEgstEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/systemTopics/devEgstEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { AzureContainer, AzureFunction, getBlobSubjectPrefix } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-007";
// Storage reports how many bytes actually landed, which is the only authority on it — the client PUTs straight
// To Azure, so nothing of ours is in the data path. This is what settles a storage quota hold into a real
// Charge against a user's allowance (/docs/platform/storage-quotas).
// Filtered to the one container whose uploads go through a quota reserve: every other blob in the account —
// Room attachments, published clones, avatars, dead-letter payloads — is accounted to nobody, so delivering it
// Would only pay a function invocation to look up a ledger row that cannot exist.
export const devEvgsEsposterAe007: azure_native.eventgrid.SystemTopicEventSubscription =
  new azure_native.eventgrid.SystemTopicEventSubscription(
    eventSubscriptionName,
    {
      deadLetterDestination: {
        blobContainerName: devstesposter001Deadletter.name,
        endpointType: "StorageBlob",
        resourceId: devstesposter001.id,
      },
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ReconcileStorageBlob}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: ["Microsoft.Storage.BlobCreated"],
        subjectBeginsWith: getBlobSubjectPrefix(AzureContainer.ResourceAssets),
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
