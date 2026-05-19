import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { devLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAuea003";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const actionGroupName = "dev-ag-esposter-003";

export const devAgEsposter003InDevRg: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "dev-ag-esposter-003-in-dev-rg",
  {
    actionGroupName,
    enabled: true,
    groupShortName: "DeleteSub",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("devAgEsposterAuea003CallbackUrl"),
        name: "dev-delete-sub",
        resourceId: devLogicEsposterAuea003.id,
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
