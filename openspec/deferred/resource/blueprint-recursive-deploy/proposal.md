# Blueprint recursive deploy

Deploying a blueprint that holds another blueprint as an entry by deploying the child as well, with the child's parameters taking values from the parent's, as ARM's linked templates compose ([Outputs in templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/outputs)).
