import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/azure/constants/AzureGlobalDisplayLocation";
import { devLogicEsposterAe001 } from "@/azure/resources/Microsoft.Logic/workflows/devLogicEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const actionGroupName = "dev-ag-esposter-001";

export const devAgEsposter001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  actionGroupName,
  {
    actionGroupName,
    enabled: true,
    groupShortName: "StopFunction",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("devAgEsposterAe001CallbackUrl"),
        name: "dev-stop-function",
        resourceId: devLogicEsposterAe001.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: devRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
