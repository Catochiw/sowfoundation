/**
 * Donation configuration. PayPal hosted buttons are pre-existing on the SOW
 * PayPal account — we just re-embed them.
 */
export interface PaypalButton {
  buttonId: string;
  labelKey: "donate.paypal.general" | "donate.paypal.scholarship";
  descriptionZh: string;
  descriptionEn: string;
}

export const paypalButtons: PaypalButton[] = [
  {
    buttonId: "2DCLT2AW2RR98",
    labelKey: "donate.paypal.general",
    descriptionZh: "支持樂助會整體事工:長者關顧、賑災救援、貧困資助等。",
    descriptionEn:
      "Sustain S.O.W.'s overall ministry: senior care, disaster relief, poverty relief, and more.",
  },
  {
    buttonId: "VKRSYH79HVXQN",
    labelKey: "donate.paypal.scholarship",
    descriptionZh: "100% 用於受助學生本人,定期收到學生報告與成長記錄。",
    descriptionEn:
      "100% goes directly to the sponsored student. You'll receive regular updates and progress reports.",
  },
];

export const checkInfo = {
  payee: "S.O.W.",
  mailToLines: [
    "S.O.W. Foundation",
    "6280 W. Las Positas Blvd., Suite 203",
    "Pleasanton, CA 94588",
    "U.S.A.",
  ],
};

export const contactInfo = {
  address: "6280 W. Las Positas Blvd., Suite 203, Pleasanton, CA 94588",
  phone: "(510) 256-5156",
  email: "Beatrice.Chan@SOWFoundation.org",
};
