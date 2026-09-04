import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "#src/azure/constants/AzureGlobalDisplayLocation";
import { devLogicEsposterAe003 } from "#src/azure/resources/Microsoft.Logic/workflows/devLogicEsposterAe003";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

const actionGroupName = "dev-ag-esposter-003";

export const devAgEsposter003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  actionGroupName,
  {
    actionGroupName,
    enabled: true,
    groupShortName: "DeleteSub",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: configuration.requireSecret("devAgEsposterAe003CallbackUrl"),
        name: "dev-delete-sub",
        resourceId: devLogicEsposterAe003.id,
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
