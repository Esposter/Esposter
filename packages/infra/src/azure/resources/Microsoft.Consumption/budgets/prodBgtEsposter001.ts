import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { prodAgEsposter001 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter001";
import { prodAgEsposter003 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter003";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getBudgetGuardArguments } from "@/azure/services/getBudgetGuardArguments";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "prod-bgt-esposter-001";

export const prodBgtEsposter001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    ...getBudgetGuardArguments(prodAgEsposter001, prodAgEsposter003),
    budgetName,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [prodFuncEsposter001.id],
      },
    },
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}`,
  },
  { protect: true },
);
