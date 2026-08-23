import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";

const systemTopicName = "dev-egst-esposter-ae-001";

export const devEgstEsposterAe001: azure_native.eventgrid.SystemTopic = new azure_native.eventgrid.SystemTopic(
  systemTopicName,
  {
    identity: {
      type: azure_native.eventgrid.IdentityType.None,
    },
    location: AzureAustraliaEastLocation,
    resourceGroupName: devRgEsposterAe001.name,
    source: devstesposter001.id,
    systemTopicName,
    tags: {
      ...ApplicationTags,
    },
    topicType: "Microsoft.Storage.StorageAccounts",
  },
  {
    parent: devstesposter001,
    protect: true,
  },
);
