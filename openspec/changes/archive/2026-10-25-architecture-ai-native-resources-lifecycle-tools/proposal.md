# Lifecycle tools

## Why

An edit to a document is only half of what a person does with a resource. They also create it, name and tag it, bin and restore it, publish it, follow what links to it, and roll it back. Each of those already has a procedure, and most are typeless, on the cross-type resource router, but no agent can reach them. Serving each operation as one tool under the Resources scope keeps the tool list from growing with the number of resource types.

## What Changes

An agent can run the lifecycle of any resource, creating, renaming, tagging, binning, restoring, duplicating, publishing, uploading files, reading references, activity, history and datasets, through one tool per operation.

- Create takes a resource type and a name.
- Rename and tag change a resource's name and tags.
- A binned resource comes back whole when restored, and a restore takes a revision first, so the restore can be undone.
- Publish and unpublish act as the resource's own type publishes. A type that does not publish is refused in words before anything runs.
- An agent uploads a file to a short-lived address and removes files; the agent's own shell sends the bytes.
- Reading references shows what a resource links to and what links to it. Writing a link into a document links it, with no separate tool.
- Blueprint capture and deploy, Program participants and status, and Survey response reads are served to agents as the owner's own acts. Follow-up procedures are unchanged.

## Capabilities

- **architecture/ai-native-resources/lifecycle-tools** (new)

## Waiting on

None.

## Impact

- The cross-type resource router, whose typeless operations are opted in and gain a typeless create and update.
- A new dispatching router, merged after the base router, which sends publish, unpublish and file operations to the resource type's own procedure.
- The capability check that decides whether a type publishes or takes files.
- Blueprint, Program, Survey and Dataset procedures opted in to agent keys.
