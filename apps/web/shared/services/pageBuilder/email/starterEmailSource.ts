// The MJML a new email starts from, a tour of what an email can hold. Each part is one a beginner can change or delete.
// The parts are the navbar, a hero, text with a merge field, columns, a divider, a table, an accordion, a button, a
// Wrapper, a group, a raw HTML block and social links. It loads no picture or font from any origin, so the editors
// Request nothing a reader has not chosen, and a survey invite is left out since it needs a published survey to link to
export const STARTER_EMAIL_SOURCE = `
<mjml>
  <mj-head>
    <mj-title>Welcome to your email</mj-title>
    <mj-preview>A short line that shows under the subject in most inboxes</mj-preview>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif"></mj-all>
      <mj-text color="#27272a" line-height="1.5"></mj-text>
      <mj-button background-color="#2563eb" border-radius="6px"></mj-button>
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f5">
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-navbar>
          <mj-navbar-link href="#">Home</mj-navbar-link>
          <mj-navbar-link href="#">Features</mj-navbar-link>
          <mj-navbar-link href="#">Contact</mj-navbar-link>
        </mj-navbar>
      </mj-column>
    </mj-section>
    <mj-hero background-color="#2563eb" padding="40px 20px">
      <mj-text font-size="28px" font-weight="bold" color="#ffffff" align="center">Welcome aboard</mj-text>
      <mj-text color="#dbeafe" align="center">Every part of this email is a block. Change any of them, or delete what you do not need.</mj-text>
      <mj-button href="#" background-color="#ffffff" color="#2563eb">Get started</mj-button>
    </mj-hero>
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-size="20px" font-weight="bold">Hello {{first_name}},</mj-text>
        <mj-text>
          Text holds your words. Select a text block to edit it on the canvas, or press Enter. Type two braces to insert a merge field from your dataset.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-weight="bold">Columns</mj-text>
        <mj-text>Columns sit side by side on a desktop and stack on a phone.</mj-text>
      </mj-column>
      <mj-column>
        <mj-text font-weight="bold">Blocks</mj-text>
        <mj-text>Each column holds any blocks you like, in any order.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-divider border-color="#d4d4d8"></mj-divider>
        <mj-table>
          <tr>
            <th align="left">Block</th>
            <th align="left">What it is for</th>
          </tr>
          <tr>
            <td>Hero</td>
            <td>A bold opening band</td>
          </tr>
          <tr>
            <td>Table</td>
            <td>Rows of facts</td>
          </tr>
        </mj-table>
        <mj-spacer height="16px"></mj-spacer>
        <mj-accordion>
          <mj-accordion-element>
            <mj-accordion-title>What is a merge field?</mj-accordion-title>
            <mj-accordion-text>A placeholder such as first name, filled with each reader's own value when you export.</mj-accordion-text>
          </mj-accordion-element>
        </mj-accordion>
      </mj-column>
    </mj-section>
    <mj-wrapper background-color="#e4e4e7" padding="20px">
      <mj-section background-color="#ffffff">
        <mj-group>
          <mj-column>
            <mj-text>A wrapper keeps its blocks together with one background.</mj-text>
          </mj-column>
          <mj-column>
            <mj-button href="#">Read the guide</mj-button>
          </mj-column>
        </mj-group>
      </mj-section>
    </mj-wrapper>
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-raw><p style="margin:0">A raw block holds HTML of your own.</p></mj-raw>
        <mj-social font-size="14px" icon-size="28px" mode="horizontal">
          <mj-social-element name="facebook" href="#">Facebook</mj-social-element>
          <mj-social-element name="twitter" href="#">Twitter</mj-social-element>
        </mj-social>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f5">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#71717a">You are receiving this because you signed up for updates.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
