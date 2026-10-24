import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";

export type WebpageKind = PageBuilderKind<WebpageNode, WebpageRootProps, WebpageNodeDefinition, WebpageDocument>;
