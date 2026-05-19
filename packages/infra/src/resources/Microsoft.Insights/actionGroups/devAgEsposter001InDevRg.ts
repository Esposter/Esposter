import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { devLogicEsposterAuea001 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAuea001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const actionGroupName = "dev-ag-esposter-001";

export const devAgEsposter001InDevRg: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "dev-ag-esposter-001-in-dev-rg",
  {
    actionGroupName,
    enabled: true,
    groupShortName: "StopFunction",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("devAgEsposterAuea001CallbackUrl"),
        name: "dev-stop-function",
        resourceId: devLogicEsposterAuea001.id,
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
