import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "#src/azure/constants/AzureGlobalDisplayLocation";
import { prodLogicEsposterAe001 } from "#src/azure/resources/Microsoft.Logic/workflows/prodLogicEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

const actionGroupName = "prod-ag-esposter-001";

export const prodAgEsposter001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  actionGroupName,
  {
    actionGroupName,
    enabled: true,
    groupShortName: "StopFunction",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: configuration.requireSecret("prodAgEsposterAe001CallbackUrl"),
        name: "prod-stop-function",
        resourceId: prodLogicEsposterAe001.id,
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
