import type { MjmlDocument } from "mjml-blocks";

import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { TEST_CONTEXT, TEST_LABEL, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import { noop } from "@esposter/shared";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(compileEmailDocument, () => {
  test("an email document with invalid markup is refused by the compile", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: { content: TEST_LABEL, id: v7(), padding: "1px 2px 3px 4px 5px" },
                      type: MjmlNodeType.Button,
                    },
                  ],
                  id: v7(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: v7(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: { lang: "", title: "" } },
    };

    await compileEmailDocument(document, TEST_CONTEXT).match(noop, (error) => {
      expect(error.message).toMatchInlineSnapshot(`
        "ValidationError: 
         Line undefined of undefined (mj-button) — Attribute padding has invalid value: 1px 2px 3px 4px 5px for type Unit, only accepts (px, %) units and 1 to 4 value(s)"
      `);
    });
  });

  test("a merge field's token compiles to the one form substitution matches", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        content: {
                          content: [{ content: [{ text: "{{P&L}}", type: "text" }], type: "paragraph" }],
                          type: "doc",
                        },
                        id: v7(),
                      },
                      type: MjmlNodeType.Text,
                    },
                  ],
                  id: v7(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: v7(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: { lang: "", title: "" } },
    };

    await compileEmailDocument(document, TEST_CONTEXT).match(
      (html) => {
        expect(html).toContain("{{P&amp;L}}");
      },
      (error) => {
        throw error;
      },
    );
  });

  test("a valid email document compiles to email HTML", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        content: {
                          content: [{ content: [{ text: TEST_LABEL, type: "text" }], type: "paragraph" }],
                          type: "doc",
                        },
                        id: v7(),
                      },
                      type: MjmlNodeType.Text,
                    },
                  ],
                  id: v7(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: v7(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: { lang: "", title: "" } },
    };
    const html = await compileEmailDocument(document, TEST_CONTEXT).match(
      (compiledHtml) => compiledHtml,
      (error) => {
        throw error;
      },
    );

    expect(html).toMatchInlineSnapshot(`
      "<!doctype html>
      <html lang="und" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <title></title>
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
            #outlook a { padding:0; }
            body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
            table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
            img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
            p { display:block;margin:13px 0; }
          </style>
          <!--[if mso]>
          <noscript>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          </noscript>
          <![endif]-->
          <!--[if lte mso 11]>
          <style type="text/css">
            .mj-outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
          
            <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
              <style type="text/css">
                @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
              </style>
            <!--<![endif]-->

          
          
          <style type="text/css">
            @media only screen and (min-width:480px) {
              .mj-column-per-100 { width:100% !important; max-width: 100%; }
            }
          </style>
          <style media="screen and (min-width:480px)">
            .moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }
          </style>
          
          
        
          
          
          
        </head>
        
            <body  style="word-spacing:normal;">
              
              <div
                 aria-roledescription="email" role="article" lang="und" dir="auto" style="word-spacing:normal;"
              >
              
            
            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          
            
            <div  style="margin:0px auto;max-width:600px;">
              
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"
              >
                <tbody>
                  <tr>
                    <td
                       style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;"
                    >
                      <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  
            <div
               class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
            >
              
            <table
               border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
            >
              <tbody>
                
                    <tr>
                      <td
                         align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                      >
                        
            <div
               style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"
            ><p>Go</p></div>
          
                      </td>
                    </tr>
                  
              </tbody>
            </table>
          
            </div>
          
                <!--[if mso | IE]></td></tr></table><![endif]-->
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>
          
            
            <!--[if mso | IE]></td></tr></table><![endif]-->
          
          
            </div>
            </body>
          
      </html>
        "
    `);
  });

  test("an email whose survey invite has an empty label is refused as an Err, not thrown", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    { props: { id: v7(), label: "", surveyId: TEST_SURVEY_ID }, type: EmailNodeType.SurveyInvite },
                  ],
                  id: v7(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: v7(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: { lang: "", title: "" } },
    };

    await compileEmailDocument(document, TEST_CONTEXT).match(noop, (error) => {
      expect(error.message).toMatchInlineSnapshot(`
        "[
          {
            "origin": "string",
            "code": "too_small",
            "minimum": 1,
            "inclusive": true,
            "path": [
              "label"
            ],
            "message": "Too small: expected string to have >=1 characters"
          }
        ]"
      `);
    });
  });
});
