import { publicAsset } from "./assets";
import HumanSociety from "./notes/week-01-human-society.mdx";
import Consciousness from "./notes/week-02-social-norms.mdx";
import SocietySystem from "./notes/week-03-society-as-system.mdx";
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
];
