# Pulumi Infra

One resource per file named after its Azure resource, `protect` on imports, a parent on every resource, outputs over repeated identifiers, and no alias.

| Unit                                                                                                         | Swept | Notes |
| ------------------------------------------------------------------------------------------------------------ | ----- | ----- |
| `apps/infra/*`, `apps/infra/src/*`                                                                           | —     |       |
| `apps/infra/src/github`                                                                                      | —     |       |
| `apps/infra/src/azure/constants`, `models`, `services`                                                       | —     |       |
| `apps/infra/src/azure/resources` — `Microsoft.Authorization`, `Microsoft.Resources`, `Microsoft.Consumption` | —     |       |
| `apps/infra/src/azure/resources` — `Microsoft.EventGrid`, `Microsoft.ServiceBus`, `Microsoft.Logic`          | —     |       |
| `apps/infra/src/azure/resources` — `Microsoft.Web`, `Microsoft.Storage`                                      | —     |       |
| `apps/infra/src/azure/resources` — `Microsoft.Insights`, `Microsoft.SignalRService`, `Microsoft.Search`      | —     |       |
