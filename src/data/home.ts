import type { Lang } from "@i18n/ui";

/**
 * Homepage content — every string is the ORIGINAL wording from the legacy
 * home page (sow_page slug=home), verbatim. Only the layout (hero, two-column
 * vision/mission, ministry feature rows) is our own design.
 *
 * scripts/verify_content.py asserts every string here is a verbatim substring
 * of the original DB content, so nothing is invented.
 */
export interface Ministry {
  title: string;
  image: string;
  href: string;
  blurb: string;
}

export interface HomeContent {
  aboutImage: string;
  intro: string;
  visionLabel: string;
  vision: string;
  missionLabel: string;
  mission: string;
  ministries: Ministry[];
}

export const home: Record<Lang, HomeContent> = {
  zh: {
    aboutImage: "/images/20180202/20180202215631_97680.jpg",
    intro:
      "樂助會「簡稱S.O.W.」是2016年於北加州灣區成立的非牟利機構。S.O.W.的團隊致力於在全球範圍內服務社區，以實際行動援助需要幫助的人，從而讓他們有機會認識那位愛的源頭 — 耶穌基督。",
    visionLabel: "願景",
    vision: "用我們的行動，讓最需要幫助的人感受到上帝的愛。",
    missionLabel: "使命",
    mission:
      "通過提供計劃、項目或實際的援助，在全球範圍內服務社區，以滿足人們在經濟上和身心靈各方面的需求。",
    ministries: [
      {
        title: "賑災援助",
        image: "/images/homepage/2.jpg",
        href: "/programs/disaster-relief",
        blurb:
          "旨在聯合眾教會，共同攜手，去幫助受災民眾，給予資助，協助災後重建。 當災難發生時，S.O.W.將整合各地教會和基督徒的資源，聯結人力、物資等，並與災區當地的教會聯合，支持災區教會在救災中發揮積極援助作用，切實幫助受災民眾，讓十字架在災區被高舉，讓神的名得榮耀！",
      },
      {
        title: "長者關顧",
        image: "/images/homepage/1.jpg",
        href: "/programs/senior-care",
        blurb:
          "關注老年群體，並以實際的行動來幫助長者解決生活中的困難。開展事工包括：長者家居維修計畫等。長者家居維修，目的是幫助有需要的長者解決生活中水電等維修難題。S.O.W.派遣熟練的維修技工，親自前往長者的居所，給予真誠實際的修理幫助，解決他們生活中的不便。水、電、門窗、廚房、浴室等，所有維修項目均為免費義務服務。",
      },
      {
        title: "愛心助學",
        image: "/images/homepage/3.jpg",
        href: "/programs/scholarship",
        blurb:
          "開展愛心助學計劃，確保每一筆慈善捐款都用在受助者的身上。愛心助學專案，旨在關懷和幫助家境貧困而品學兼優的莘莘學子，資助他們學費、住宿費、書本費及雜費等，幫助他們完成學業，使他們有機會接受教育，以知識脫貧。S.O.W.還將不斷跟進學生情況，監察學生進度，並組織前往學校，讓愛心人士可親身瞭解學生情況。",
      },
      {
        title: "遊學培訓",
        image: "/images/homepage/4.jpg",
        href: "/tours/holy-land",
        blurb:
          "策劃和組織聖地遊覽、退修營會、宣教之旅等主題遊學專案。通過實地考察、講師教導、理論實踐等融合為一，在旅遊中學習、實踐，寓教於樂、以多方互動的方式，增強遊覽者對基督信仰、歷史文化的認識，對人們的精神生活也產生積極深遠影響。",
      },
      {
        title: "貧困資助",
        image: "/images/homepage/8.jpg",
        href: "/programs/poverty-relief",
        blurb:
          "開展貧困資助項目，關心遭遇困難的貧困家庭或個人，在他們身處困境之時，伸出援手，以捐助資金、物資等方式，維持他們基本生活需要，並積極提供人力、物力資源聯結，幫助他們能夠走出困境，重新回歸正常生活。",
      },
    ],
  },
  en: {
    aboutImage: "/images/20180213/20180213053955_13683.jpg",
    intro:
      "S.O.W., or Serving Others Worldwide, is a nonprofit organization incorporated in the San Francisco Bay Area in 2016. The team of S.O.W. strives to serve our communities by providing programs, projects or tangible assistance to meet their economic, physical, mental and spiritual needs on local and global level.",
    visionLabel: "Vision",
    vision: "Let the most needy see the love of God through our actions.",
    missionLabel: "Mission",
    mission:
      "To serve our communities worldwide by providing programs, projects or tangible assistance to meet their economic, physical, mental and spiritual needs.",
    ministries: [
      {
        title: "Disaster Relief",
        image: "/images/homepage/2.jpg",
        href: "/programs/disaster-relief",
        blurb:
          "S.O.W. Disaster Relief aims to unite all churches together to provide relief efforts and resources to victims and the affected people, assisting them in reconstruction. When a disaster strikes, S.O.W. will integrate the resources of all churches and Christians, including personnel and tangible supplies, to work with local churches in the affected areas to play an active role in disaster relief in their communities and to exalt the Holy Cross and glorify the Lord’s name.",
      },
      {
        title: "Senior Care",
        image: "/images/homepage/1.jpg",
        href: "/programs/senior-care",
        blurb:
          "S.O.W. focuses on the elderly people and takes actions to help them solve the difficulties in their daily life. Our program also extends into Senior Home Maintenance, where we aim to help elders with their plumbing, electrical and maintenance issues around their home. S.O.W. will send experienced repair people to the homes of the elderly and provide genuine repairs to help them solve their daily inconveniences. Repairs can include all plumbing, electrical, doors, windows, kitchen, bathroom, etc. All services are provided free of charge.",
      },
      {
        title: "Scholarship",
        image: "/images/homepage/3.jpg",
        href: "/programs/scholarship",
        blurb:
          "S.O.W. created a scholarship program to allow each charitable donations reach their target students fully and directly. Scholarship Program aims at caring for and assisting poor students, who maintain a certain level of academic grades, by subsidizing for their tuition fees, room and board, textbooks, and other miscellaneous fees to help them complete their studies and degree programs. The scholarship recipients will have an opportunity to receive education and leave poverty. S.O.W. will continue to follow up and monitor the progress of the program as well as arrange trips for donors to visit the schools and get to know each scholarship recipients.",
      },
      {
        title: "Study – Abroad Tours",
        image: "/images/homepage/4.jpg",
        href: "/tours/holy-land",
        blurb:
          "S.O.W. plans and arranges Holy Land tours, spiritual retreats, mission trips and other thematic study-abroad tours. Through field trips and real-time lectures, incorporating theory with practice, participants can learn and have fun with interactive teaching methods to enhance their understanding of Christian faith, its history and culture. There will be a positive and far-reaching impact on their spiritual life as well.",
      },
      {
        title: "Grants",
        image: "/images/homepage/8.jpg",
        href: "/programs/poverty-relief",
        blurb:
          "Use practical actions to help those who need it the most. S.O.W. Grants program aims to support and care for the poor families or individuals who have encountered difficulties. During their particular difficult time, S.O.W. will maintain their necessities in life by donating funds, materials, and other means to help them be able to return to their normal life.",
      },
    ],
  },
};
