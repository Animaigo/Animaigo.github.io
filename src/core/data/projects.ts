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
  {
    id: "textbook-knowledgebase",
    title: "教材知识库工具包",
    summary: "把 OCR 过的教科书 PDF 转成可逐页溯源的 Markdown 原文，让 AI 按书上页码读原文、引原句。",
    detail:
      "一个纯 Python 工具包：把 PDF 变成「可逐页溯源的 Markdown 原文」，让 AI 基于它写作，并在交付前逐句回查。校验的是字面一致性——输出的文字是不是课本原文，不保证知识对错，也不改写原文。不限学科，教材、国标、规范、法规都能入库。只含工具，不含任何书籍正文。",
    status: "工具包",
    year: "2026",
    tags: ["Python", "OCR", "知识库", "页码溯源"],
    image: "/themes/fuyukawa-kagari/assets/project-textbook.webp",
    size: "wide",
    links: [{ label: "GitHub", href: "https://github.com/Animaigo/Textbook-knowledgebase" }]
  }
];
