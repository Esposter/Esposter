import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { html } from "@/services/prettier/html";
import { z } from "zod/v4";

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

  constructor(init?: Partial<EmailEditor>) {
    super();
    Object.assign(this, init);
  }
}

export const emailEditorSchema = z.record(z.string().min(1), z.unknown());
