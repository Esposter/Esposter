import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import type { MjmlNode, MjmlNodeDefinition, MjmlRootProps } from "mjml-blocks";
import type { z } from "zod";

export type EmailKind = PageBuilderKind<
  MjmlNode,
  MjmlRootProps,
  MjmlNodeDefinition<MjmlNode, RenderContext>,
  z.output<typeof emailDocumentSchema>
>;
