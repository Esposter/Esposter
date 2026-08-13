import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";

// EventGrid Contributor, whose actions cover `Microsoft.EventGrid/*`, where the narrower EventGrid
// EventSubscription Contributor stops at the standalone
// `Microsoft.EventGrid/eventSubscriptions/*` extension type. A subscription that lives under a topic is the
// Separate `Microsoft.EventGrid/topics/eventSubscriptions` child type, which that role never grants — reading
// One 403s under it. The assignments are scoped to a single topic, so this is full control of that topic alone
const AzureEventGridContributorRoleDefinitionId: `/subscriptions/${string}/providers/Microsoft.Authorization/roleDefinitions/${string}` = `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/1e241071-0855-49ea-94dc-649edcd759de`;

export default AzureEventGridContributorRoleDefinitionId;
