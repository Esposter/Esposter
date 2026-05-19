import AzureEventGridDataSenderRoleDefinitionId from "@/constants/AzureEventGridDataSenderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import PShpFuncEsposterAuea001PrincipalId from "@/constants/PShpFuncEsposterAuea001PrincipalId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "89ceea45-80f3-4c5a-b817-24286b007145";

export const pShpFuncEsposterAuea001EventGridDataSender: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-func-esposter-auea-001-event-grid-data-sender",
    {
      principalId: PShpFuncEsposterAuea001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridDataSenderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
