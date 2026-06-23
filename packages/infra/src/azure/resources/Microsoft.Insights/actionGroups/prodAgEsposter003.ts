import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/azure/constants/AzureGlobalDisplayLocation";
import { prodLogicEsposterAe003 } from "@/azure/resources/Microsoft.Logic/workflows/prodLogicEsposterAe003";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const actionGroupName = "prod-ag-esposter-003";

export const prodAgEsposter003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  actionGroupName,
  {
    actionGroupName,
    enabled: true,
    groupShortName: "DeleteSub",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("prodAgEsposterAe003CallbackUrl"),
        name: "prod-delete-sub",
        resourceId: prodLogicEsposterAe003.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: prodRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
