// Projects 页的唯一数据源（两个主题共用）。
// 目前**没有卡片**：把条目写进来，Projects 页的拼贴墙才会出现。
// 字段说明：
//   id      唯一标识，也是共享元素过渡的名字，别重复
//   title / summary   卡片上的标题与一句话简介
//   detail  点开后详情面板里的正文
//   status / year     详情里那行小字（例：已上线 · 2026）
//   tags    技术栈 / 关键词
//   image   封面图，放 public/ 下写站内绝对路径
//   size    拼贴尺寸档：small = 1×2，wide = 2×2，tall = 1×3，big = 2×3
//   links   详情底部的按钮 [{ label, href }]

export type ProjectSize = "small" | "wide" | "tall" | "big";

export interface ProjectEntry {
  id: string;
  title: string;
  summary: string;
  detail: string;
  status: string;
  year: string;
  tags: string[];
  image: string;
  size: ProjectSize;
  links: Array<{ label: string; href: string }>;
}

// 技术线索引（Blank 主题的 Projects 页会列出来）
export const projectTechLines: Array<{
  key: string;
  label: string;
  note: string;
}> = [
  // 例：{ key: "diary", label: "手账", note: "生活记录 / 每月小结" }
];

export const projectEntries: ProjectEntry[] = [
  // 例：
  // {
  //   id: "monthly-diary",
  //   title: "每月手账",
  //   summary: "把值得记住的日常按月收进同一页。",
  //   detail: "月度小结、照片与碎片、本月推荐……",
  //   status: "持续更新",
  //   year: "2026",
  //   tags: ["Astro", "数据驱动"],
  //   image: "/themes/fuyukawa-kagari/assets/hero-wallpaper.webp",
  //   size: "wide",
  //   links: [{ label: "GitHub", href: "https://github.com/Animaigo" }]
  // }
];
