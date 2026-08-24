// How each Function App is allowed to fetch the deployment package its `WEBSITE_RUN_FROM_PACKAGE` names. That
// Url is a blob in a private container, so without this the platform fetches it anonymously, gets 404, mounts
// Nothing, and indexes no functions at all — a Function App that reports Running and deploys "successfully"
// While `az functionapp function list` is empty and every Event Grid subscription pointing at one of its
// Functions fails endpoint validation with NotFound.
// `SystemAssigned` is the identity each app already carries, and it already holds Storage Blob Data Owner on its
// Own account — the same keyless posture `AzureWebJobsStorage__credential` uses for the runtime's own storage.
const AzureRunFromPackageIdentitySetting: { name: string; value: string } = {
  name: "WEBSITE_RUN_FROM_PACKAGE_BLOB_MI_RESOURCE_ID",
  value: "SystemAssigned",
};

export default AzureRunFromPackageIdentitySetting;
