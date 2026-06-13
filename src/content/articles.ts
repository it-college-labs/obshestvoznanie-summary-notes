import { publicAsset } from "./assets";
import HumanSociety from "./notes/week-01-human-society.mdx";
import Consciousness from "./notes/week-02-social-norms.mdx";
import SocietySystem from "./notes/week-03-society-as-system.mdx";
import SocietyConcept from "./notes/week-04-society-concept.mdx";
import TypesOfSociety from "./notes/week-05-types-of-society.mdx";
import Evolution from "./notes/week-06-evolution.mdx";
import CultureSpiritualLife from "./notes/week-07-culture-spiritual-life.mdx";
import ScienceEducation from "./notes/week-08-science-education.mdx";
import WorldReligions from "./notes/week-09-world-religions.mdx";
import BankingCreditMortgage from "./notes/week-11-12-banking-credit-mortgage.mdx";
import TaxesRussia from "./notes/week-13-taxes-russia.mdx";
import FamilyMarriage from "./notes/week-14-family-marriage.mdx";
import StratificationMobility from "./notes/week-15-stratification-mobility.mdx";
import Migration from "./notes/week-16-migration.mdx";
import SocialConflict from "./notes/week-17-social-conflict.mdx";
import type { ArticleConfig } from "./types";

const botThinkingImage = publicAsset("assets/placeholders/bot-placeholder.png");

export const articles: ArticleConfig[] = [
  {
    id: "week-01-human-society",
    week: "Неделя 1",
    title: "Природное и общественное в человеке",
    annotation:
      "Человек рождается биологическим существом, но становится личностью только внутри общества. Разбираем три уровня описания человека и что такое деятельность.",
    tags: ["личность", "индивид", "деятельность"],
    accent: ["#6ee7f9", "#a78bfa", "#fb7185"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-human-01.svg"),
      publicAsset("assets/placeholders/preview-human-02.svg"),
      publicAsset("assets/placeholders/preview-human-03.svg"),
    ],
    botThinkingImage,
    mdx: HumanSociety,
    readingTime: "8 минут",
    status: "ready",
  },
  {
    id: "week-02-consciousness",
    week: "Неделя 2",
    title: "Сознание, мировоззрение, мышление",
    annotation:
      "Мировоззрение — это очки, через которые мы видим мир. Типы мышления, уровни сознания и почему одна danetka может изменить ваше представление о реальности.",
    tags: ["сознание", "мышление", "мировоззрение"],
    accent: ["#fde047", "#34d399", "#60a5fa"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: Consciousness,
    readingTime: "7 минут",
    status: "ready",
  },
  {
    id: "week-03-society-system",
    week: "Неделя 3",
    title: "Общество как система",
    annotation:
      "Общество — не толпа людей, а сеть устойчивых связей. Четыре подсистемы, социальные институты, группы и пять парадигм социологии в одном разборе.",
    tags: ["система", "институты", "группы"],
    accent: ["#c084fc", "#f472b6", "#38bdf8"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: SocietySystem,
    readingTime: "9 минут",
    status: "ready",
  },
  {
    id: "week-04-society-concept",
    week: "Неделя 4",
    title: "Понятие общества и общественные отношения",
    annotation:
      "Общество, социум, социальные институты, группы, идентичность — разбираем, из чего состоит социальная система и как люди в ней взаимодействуют.",
    tags: ["общество", "институты", "группы", "идентичность"],
    accent: ["#86efac", "#fbbf24", "#f97316"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: SocietyConcept,
    readingTime: "9 минут",
    status: "ready",
  },
  {
    id: "week-05-types-of-society",
    week: "Неделя 5",
    title: "Типы обществ и массовые коммуникации",
    annotation:
      "Традиционное, индустриальное, постиндустриальное — три типа общества. Массовые коммуникации, спираль молчания, окно Овертона и информационные пузыри.",
    tags: ["типы обществ", "коммуникации", "массовое сознание"],
    accent: ["#a78bfa", "#67e8f9", "#fda4af"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: TypesOfSociety,
    readingTime: "10 минут",
    status: "ready",
  },
  {
    id: "week-06-evolution",
    week: "Неделя 6",
    title: "Эволюция и формы общественного развития",
    annotation:
      "Эволюция, революция, реформа — три пути развития. Теории прогресса, критика и парадоксы: когда прогресс становится проблемой.",
    tags: ["эволюция", "революция", "реформа", "прогресс"],
    accent: ["#fb923c", "#a3e635", "#38bdf8"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: Evolution,
    readingTime: "9 минут",
    status: "ready",
  },
  {
    id: "week-07-culture-spiritual-life",
    week: "Неделя 7",
    title: "Духовная деятельность, культура и субкультура",
    annotation:
      "Культура как среда смыслов: духовная деятельность, материальная и духовная культура, народная, элитарная и массовая формы, субкультура и контркультура.",
    tags: ["культура", "духовная сфера", "субкультура"],
    accent: ["#ac2954", "#d84c78", "#a78bfa"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: CultureSpiritualLife,
    readingTime: "12 минут",
    status: "ready",
  },
  {
    id: "week-08-science-education",
    week: "Неделя 8",
    title: "Наука и образование",
    annotation:
      "Критерии научного знания, факты, гипотезы, теории, методы исследования, научно-технологическое развитие России и образование как социальный институт.",
    tags: ["наука", "образование", "познание"],
    accent: ["#ac2954", "#f472b6", "#60a5fa"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: ScienceEducation,
    readingTime: "12 минут",
    status: "ready",
  },
  {
    id: "week-09-world-religions",
    week: "Неделя 9",
    title: "Религии мира",
    annotation:
      "Религия как социальный институт: функции, мировые религии, мораль, право, светское государство и культурное влияние религиозных традиций.",
    tags: ["религия", "мировые религии", "духовная культура"],
    accent: ["#ac2954", "#a78bfa", "#f59e0b"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: WorldReligions,
    readingTime: "10 минут",
    status: "ready",
  },
  {
    id: "week-11-12-banking-credit-mortgage",
    week: "Недели 11-12",
    title: "Банковская система, кредиты и ипотека",
    annotation:
      "Финансовые институты, функции ЦБ и коммерческих банков, кредитные договоры, кредитная история, МФО и ипотека как долгосрочный финансовый выбор.",
    tags: ["банки", "кредиты", "ипотека"],
    accent: ["#ac2954", "#38bdf8", "#fbbf24"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: BankingCreditMortgage,
    readingTime: "14 минут",
    status: "ready",
  },
  {
    id: "week-13-taxes-russia",
    week: "Неделя 13",
    title: "Налоги в России",
    annotation:
      "Налоги как обязательные платежи и социальный механизм: функции, ставки, прямые и косвенные налоги, НДФЛ, НДС, имущество, вклады и вычеты.",
    tags: ["налоги", "НДФЛ", "НДС"],
    accent: ["#ac2954", "#86efac", "#f97316"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: TaxesRussia,
    readingTime: "13 минут",
    status: "ready",
  },
  {
    id: "week-14-family-marriage",
    week: "Неделя 14",
    title: "Семья и брак",
    annotation:
      "Семья как малая группа и социальный институт: брак, функции семьи, семейные ценности, подходы к анализу, гендерные роли и меры поддержки.",
    tags: ["семья", "брак", "социальный институт"],
    accent: ["#ac2954", "#f9a8d4", "#a78bfa"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: FamilyMarriage,
    readingTime: "11 минут",
    status: "ready",
  },
  {
    id: "week-15-stratification-mobility",
    week: "Неделя 15",
    title: "Социальная стратификация и социальная мобильность",
    annotation:
      "Страты, исторические системы неравенства, критерии статуса, социальные роли, мобильность, каналы перемещения и коэффициент Джини.",
    tags: ["стратификация", "мобильность", "неравенство"],
    accent: ["#ac2954", "#c084fc", "#34d399"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: StratificationMobility,
    readingTime: "12 минут",
    status: "ready",
  },
  {
    id: "week-16-migration",
    week: "Неделя 16",
    title: "Миграция",
    annotation:
      "Миграция как демографический и социальный процесс: типология, потоки и сальдо, мобильный переход, замещающая миграция и интеграция.",
    tags: ["миграция", "демография", "интеграция"],
    accent: ["#ac2954", "#67e8f9", "#fbbf24"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: Migration,
    readingTime: "12 минут",
    status: "ready",
  },
  {
    id: "week-17-social-conflict",
    week: "Неделя 17",
    title: "Социальный конфликт",
    annotation:
      "Причины и формы конфликтов, стадии развития, классификации, переговоры, посредничество, арбитраж и разбор трудового конфликта.",
    tags: ["конфликт", "переговоры", "социальные группы"],
    accent: ["#ac2954", "#fb7185", "#f97316"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: SocialConflict,
    readingTime: "11 минут",
    status: "ready",
  },
];
