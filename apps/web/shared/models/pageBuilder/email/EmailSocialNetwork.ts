import { z } from "zod";

// The networks MJML draws an icon for, from Mailjet's icon set; twitter and google are left out for x and a network
// That is gone
export enum EmailSocialNetwork {
  Dribbble = "dribbble",
  Facebook = "facebook",
  GitHub = "github",
  Instagram = "instagram",
  LinkedIn = "linkedin",
  Medium = "medium",
  Pinterest = "pinterest",
  Snapchat = "snapchat",
  SoundCloud = "soundcloud",
  Tumblr = "tumblr",
  Vimeo = "vimeo",
  Web = "web",
  X = "x",
  Xing = "xing",
  YouTube = "youtube",
}

export const emailSocialNetworkSchema = z.enum(EmailSocialNetwork) satisfies z.ZodType<EmailSocialNetwork>;
