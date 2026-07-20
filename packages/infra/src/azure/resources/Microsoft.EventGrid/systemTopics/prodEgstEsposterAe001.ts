import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";

const systemTopicName = "prod-egst-esposter-ae-001";

export const prodEgstEsposterAe001: azure_native.eventgrid.SystemTopic = new azure_native.eventgrid.SystemTopic(
  systemTopicName,
  {
    identity: {
      type: azure_native.eventgrid.IdentityType.None,
    },
    location: AzureAustraliaEastLocation,
    resourceGroupName: prodRgEsposterAe001.name,
    source: prodstesposter001.id,
    systemTopicName,
    tags: {
      ...ApplicationTags,
    },
    topicType: "Microsoft.Storage.StorageAccounts",
  },
  {
    parent: prodstesposter001,
  },
);
