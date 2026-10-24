import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { MjmlNode, MjmlNodeDefinition, MjmlRootProps } from "mjml-blocks";

export type EmailKind = PageBuilderKind<
  MjmlNode,
  MjmlRootProps,
  MjmlNodeDefinition<MjmlNode, RenderContext>,
  EmailDocument
>;
