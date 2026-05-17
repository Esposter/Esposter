import * as azure_native from "@pulumi/azure-native";

export const paRequireApplicationTag: azure_native.authorization.PolicyAssignment =
  new azure_native.authorization.PolicyAssignment(
    "pa-require-application-tag",
    {
      definitionVersion: "1.*.*",
      displayName: "Require a tag on resources",
      enforcementMode: azure_native.authorization.EnforcementMode.Default,
      metadata: {
        assignedBy: "Jimmy Chen",
        createdBy: "e87770fc-45f1-4ba0-ace2-54b0f804be86",
        createdOn: "2023-05-03T03:40:30.3587404Z",
      },
      parameters: {
        tagName: {
          value: "Application",
        },
      },
      policyAssignmentName: "7b87693e9a494c838ffac3d7",
      policyDefinitionId: "/providers/Microsoft.Authorization/policyDefinitions/871b6d14-10aa-478d-b590-94f262ecfa99",
      scope: "subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb",
    },
    {
      protect: true,
    },
  );
