import { absolutizeResourceAssetUrls } from "@/services/resource/absolutizeResourceAssetUrls";

// The personalised export compiles the stored working copy on the server, so it runs with the editor closed. The command
// Bar and the truncation confirm share this step and `exportPersonalizedRows`: the email is compiled once, then each row
// Fills in the same html
export const compileStoredEmail = async (resourceId: string) => {
  const { $trpc } = useNuxtApp();
  const { datasetReference, html } = await $trpc.email.generateEmailHtml.query({ id: resourceId });
  return { datasetReference, html: absolutizeResourceAssetUrls(html, window.location.origin) };
};
