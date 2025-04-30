import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class EmailEditor extends AItemEntity implements ProjectData {
  pages: unknown[] = [
    {
      component: `
      <mjml>
        <mj-body>
        </mj-body>
      </mjml>
      `,
    },
  ];
}

export const emailEditorSchema = z.record(z.string().min(1), z.unknown());
