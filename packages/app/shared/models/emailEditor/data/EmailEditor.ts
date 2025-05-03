import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { html } from "@/services/prettier/html";
import { z } from "zod";

export class EmailEditor extends AItemEntity implements ProjectData {
  [key: string]: unknown;
  pages: unknown[] = [
    {
      component: html`
        <mjml>
          <mj-body></mj-body>
        </mjml>
      `,
    },
  ];
}

export const emailEditorSchema = z.record(z.string().min(1), z.unknown());
