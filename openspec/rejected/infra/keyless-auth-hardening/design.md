# Keyless auth hardening

The app authenticates to Storage, Search, Event Grid and Service Bus with keys and connection strings, and each of those keys holds a switch the security posture would turn off: storage shared-key access, blob public access, and Search and Event Grid local auth. The idea was the app-side migration that unblocks them, a service principal in place of the keys with the least-privilege roles Azure Functions already use, and user-delegation SAS where storage keys are disabled.

**Why not:** keyless auth means Entra identity, and Entra identity for the app means hosting the app on Azure, which is where its managed identity lives. The app runs on Railway, so keyless auth would move the infrastructure for cost and convenience, and neither earns it. Keys stay in configuration and Key Vault, where the credentials are held today.

## Sources

- [Azure Storage — prevent authorization with Shared Key](https://learn.microsoft.com/en-us/azure/storage/common/shared-key-authorization-prevent) — `allowSharedKeyAccess`, and a user delegation SAS as the one SAS still permitted once it is false.
- [Azure Storage — create a user delegation SAS](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas) — the SAS the upload and read urls would have moved to.
- [Azure AI Search — enable role-based access control](https://learn.microsoft.com/en-us/azure/search/search-security-enable-roles) — `disableLocalAuth` and the data-plane roles that replace the admin key.
- [Event Grid — authenticate publishing clients with Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/event-grid/authenticate-with-microsoft-entra-id) — a service principal through `DefaultAzureCredential`'s environment variables, the **EventGrid Data Sender** role, and `disableLocalAuth`.
