import { getRoleDefinitionId } from "#src/azure/services/getRoleDefinitionId";

// EventGrid Contributor rather than the narrower EventGrid EventSubscription Contributor, which never reaches a
// Subscription under a topic (openspec/specs/infra/cost-and-security-posture/design.md)
const AzureEventGridContributorRoleDefinitionId: string = getRoleDefinitionId("1e241071-0855-49ea-94dc-649edcd759de");

export default AzureEventGridContributorRoleDefinitionId;
