import type { Lang } from "@i18n/ui";

/**
 * Donate-page content. Every string here is the ORIGINAL wording from the
 * legacy donation page (sow_page slug=donation), verbatim — only the layout
 * (cards, buttons) is our own design.
 *
 * The PayPal "一般奉獻 / General Donation" giving is hosted-button
 * 2DCLT2AW2RR98 on S.O.W.'s PayPal account; it MUST be submitted as a POST
 * form (a plain GET link to webscr returns an error), which DonateButtons.astro
 * does.
 */
export interface DonateContent {
  taxNote: string;
  paypalIntro: string;
  paypalButtonLabel: string;
  ukraineNote: string;
  checkIntro: string;
  addressLines: string[];
  schwab: string;
  contactIntro: string;
  phone: string;
  email: string;
  thanks: string;
}

export const paypalHostedButtonId = "2DCLT2AW2RR98";

export const donate: Record<Lang, DonateContent> = {
  zh: {
    taxNote:
      "「樂助會」是一間由美國國稅局IRS正式核准的501(c)(3)非牟利慈善機構，我們所提供的捐款收據可作報稅用。",
    paypalIntro: "您也可以由以下 Paypal 安全地網路奉獻：",
    paypalButtonLabel: "一般奉獻",
    ukraineNote: "支援烏克蘭",
    checkIntro: "支票抬頭請寫「S.O.W.」，並寄至：",
    addressLines: ["S.O.W.", "6280 W. Las Positas Blvd., Suite 203", "Pleasanton, CA 94588", "U.S.A."],
    schwab: "Charles Schwab 户口號碼: 4507-8379",
    contactIntro: "我們的電話和 e-mail 是",
    phone: "電話: 1+ (510) 256-5156",
    email: "電郵: info@sowfoundation.org",
    thanks: "感謝您的無私奉獻！",
  },
  en: {
    taxNote:
      "Serving Others Worldwide (S.O.W.) is an U.S.A IRS approved 501(c)(3) nonprofit organization. Donations are tax-deductible to the extent permitted by law. Our Federal Tax ID # is 81-3947479.",
    paypalIntro: "You may also donate via Paypal, by clicking on the button provided below:",
    paypalButtonLabel: "General Donation",
    ukraineNote: "Ukraine Refugee Relief",
    checkIntro: "Please make donations payable to S.O.W., and mail to:",
    addressLines: ["S.O.W.", "6280 W. Las Positas Blvd., Suite 203", "Pleasanton, CA 94588", "U.S.A."],
    schwab: "Charles Schwab Account Number: 4507-8379",
    contactIntro: "Here is our contact phone number and email:",
    phone: "Tel: 1+ (510) 256-5156",
    email: "Email: info@sowfoundation.org",
    thanks: "Thank you so much for your generosity!",
  },
};
