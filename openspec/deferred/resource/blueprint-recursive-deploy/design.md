# Blueprint recursive deploy

Deploying a blueprint that holds another blueprint as an entry by deploying the child as well, with the child's parameters taking values from the parent's, as ARM's linked templates compose ([Outputs in templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/outputs)).

## Why deferred

A Blueprint entry is created as a resource whose manifest is its content, and the outer deploy treats that content as opaque so the two grammars of tokens never mix ([blueprint resource](../../../specs/resource/blueprint-resource/design.md)). A recursive deploy needs the parent to hand parameter values down and read created ids back up, which is the parameter-passing and outputs design that ARM's nested templates carry, and one blueprint per set is what an owner writes today.

## Revisit when

A manifest is wanted that deploys two sets, each already its own blueprint, and copying the entries of one into the other has drifted from the original.
