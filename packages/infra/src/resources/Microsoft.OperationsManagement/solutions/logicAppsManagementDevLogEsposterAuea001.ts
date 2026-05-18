import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/constants/AzureMicrosoftPublisherName";
import { devLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/devLogEsposterAuea001";
import { devRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const solutionName = "LogicAppsManagement(dev-log-esposter-auea-001)";

export const logicAppsManagementDevLogEsposterAuea001: azure_native.operationsmanagement.Solution =
  new azure_native.operationsmanagement.Solution(
    solutionName,
    {
      location: AzureAustraliaEastLocation,
      plan: {
        name: solutionName,
        product: AzureLogicAppsManagementSolutionProduct,
        promotionCode: "",
        publisher: AzureMicrosoftPublisherName,
      },
      properties: {
        containedResources: [pulumi.interpolate`${devLogEsposterAuea001.id}/views/${solutionName}`],
        workspaceResourceId: devLogEsposterAuea001.id,
      },
      resourceGroupName: devRgEsposterAuea001.name,
      solutionName,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: devLogEsposterAuea001,
      protect: true,
    },
  );
