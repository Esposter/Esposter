import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";

export type WebpageKind = PageBuilderKind<WebpageNode, WebpageRootProps, WebpageNodeDefinition, WebpageDocument>;
