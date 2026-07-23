import ApplicationTagName from "@/azure/constants/ApplicationTagName";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import * as azure_native from "@pulumi/azure-native";

const policyAssignmentName = "pa-esposter-001";

export const paEsposter001: azure_native.authorization.PolicyAssignment =
  new azure_native.authorization.PolicyAssignment(
    policyAssignmentName,
    {
      definitionVersion: "1.*.*",
      displayName: "Require a tag on resources",
      enforcementMode: azure_native.authorization.EnforcementMode.Default,
      metadata: {
        assignedBy: "Jimmy Chen",
      },
      parameters: {
        tagName: {
          value: ApplicationTagName,
        },
      },
      policyAssignmentName,
      policyDefinitionId: "/providers/Microsoft.Authorization/policyDefinitions/871b6d14-10aa-478d-b590-94f262ecfa99",
      scope: `subscriptions/${AzureSubscriptionId}`,
    },
    {
      aliases: [{ name: "pa-require-application-tag" }],
      protect: true,
    },
  );
