import { publicAsset } from "./assets";
import HumanSociety from "./notes/week-01-human-society.mdx";
import SocialNorms from "./notes/week-02-social-norms.mdx";
import type { ArticleConfig } from "./types";

const botThinkingImage = publicAsset("assets/placeholders/bot-placeholder.png");

export const articles: ArticleConfig[] = [
  {
    id: "week-01-human-society",
    week: "Неделя 1",
    title: "Человек и общество",
    annotation:
      "Стартовая тема: чем человек отличается от индивида, почему общество работает как система и где в этом месте появляется деятельность.",
    tags: ["личность", "общество", "деятельность"],
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
    id: "week-02-social-norms",
    week: "Неделя 2",
    title: "Социальные нормы и контроль",
    annotation:
      "Как общество удерживает порядок: нормы, санкции, мораль, право и тонкая граница между привычкой и правилом.",
    tags: ["нормы", "санкции", "право"],
    accent: ["#fde047", "#34d399", "#60a5fa"],
    folderPreviewImages: [
      publicAsset("assets/placeholders/preview-norms-01.svg"),
      publicAsset("assets/placeholders/preview-norms-02.svg"),
      publicAsset("assets/placeholders/preview-norms-03.svg"),
    ],
    botThinkingImage,
    mdx: SocialNorms,
    readingTime: "7 минут",
    status: "ready",
  },
];
