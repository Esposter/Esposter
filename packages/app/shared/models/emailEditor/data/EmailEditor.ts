import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { BLOGSPOT_BASE_URL, PLACEHOLD_BASE_URL, WORDPRESS_DESIGNSPELL_BASE_URL } from "@/services/grapesjs/constants";
import { html } from "@/services/prettier/html";
import { z } from "zod";

export class EmailEditor extends AItemEntity implements ProjectData {
  [key: string]: unknown;
  pages: unknown[] = [
    {
      component: html`
        <mjml>
          <mj-body>
            <mj-section background-color="#f0f0f0">
              <mj-column>
                <mj-text font-style="italic" font-size="20px" color="#626262">My Company</mj-text>
              </mj-column>
            </mj-section>
            <mj-section
              background-url="${BLOGSPOT_BASE_URL}/-TPrfhxbYpDY/Uh3Refzk02I/AAAAAAAALw8/5sUJ0UUGYuw/s1600/New+York+in+The+1960's+-+70's+(2).jpg"
              background-size="cover"
              background-repeat="no-repeat"
            >
              <mj-column>
                <mj-text align="center" color="#fff" font-size="40px" font-family="Helvetica Neue"
                  >Slogan here
                </mj-text>
                <mj-button background-color="#F63A4D" href="#"> Promotion </mj-button>
              </mj-column>
            </mj-section>
            <mj-section background-color="#fafafa">
              <mj-column width="400px">
                <mj-text font-style="italic" font-size="20px" font-family="Helvetica Neue" color="#626262"
                  >My Awesome Text
                </mj-text>
                <mj-text color="#525252">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum enim eget magna efficitur, eu
                  semper augue semper. Aliquam erat volutpat. Cras id dui lectus. Vestibulum sed finibus lectus, sit
                  amet suscipit nibh. Proin nec commodo purus. Sed eget nulla elit. Nulla aliquet mollis faucibus.
                </mj-text>
                <mj-button background-color="#F45E43" href="#">Learn more </mj-button>
              </mj-column>
            </mj-section>
            <mj-section background-color="white">
              <mj-column>
                <mj-image
                  width="200px"
                  src="${WORDPRESS_DESIGNSPELL_BASE_URL}/wp-content/uploads/2012/01/sciolino-paris-bw.jpg"
                ></mj-image>
              </mj-column>
              <mj-column>
                <mj-text font-style="italic" font-size="20px" font-family="Helvetica Neue" color="#626262">
                  Find amazing places
                </mj-text>
                <mj-text color="#525252">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum enim eget magna efficitur, eu
                  semper augue semper. Aliquam erat volutpat. Cras id dui lectus. Vestibulum sed finibus lectus.
                </mj-text>
              </mj-column>
            </mj-section>
            <mj-section background-color="#fbfbfb">
              <mj-column>
                <mj-image width="100px" src="${PLACEHOLD_BASE_URL}/100x30/459ba8/fff"></mj-image>
              </mj-column>
              <mj-column>
                <mj-image width="100px" src="${PLACEHOLD_BASE_URL}/100x30/79c267/fff"></mj-image>
              </mj-column>
              <mj-column>
                <mj-image width="100px" src="${PLACEHOLD_BASE_URL}/100x30/c5d647/fff"></mj-image>
              </mj-column>
            </mj-section>
            <mj-section background-color="#e7e7e7">
              <mj-column>
                <mj-button href="#">Hello There!</mj-button>
                <mj-social font-size="15px" icon-size="30px" mode="horizontal">
                  <mj-social-element name="facebook" href="https://mjml.io">Facebook</mj-social-element>
                  <mj-social-element name="google" href="https://mjml.io">Google</mj-social-element>
                  <mj-social-element name="twitter" href="https://mjml.io">Twitter</mj-social-element>
                </mj-social>
              </mj-column>
            </mj-section>
          </mj-body>
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
