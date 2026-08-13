import type { ResourceType } from "@esposter/db-schema";

// A resource type's procedures live on the router named after it — `Sheet` on `sheet`, `TodoList` on `todoList` —
// So the type is its router key, uncapitalized. Indexing the client with that is what makes the correspondence
// Checked: a type whose router is missing or misnamed stops resolving here instead of at the first click, and
// The capability-gated procedures arrive gated the same way the server declares them, so reaching for one a type
// Does not have is a type error rather than an optional member someone forgot to check.
// Each type's own content schema rides along too — content is only `unknown` to a caller that has not said
// Which type it opens
export type ResourceRouter<TType extends ResourceType> = ReturnType<typeof useNuxtApp>["$trpc"][Uncapitalize<TType>];
