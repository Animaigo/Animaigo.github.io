export const site = {
  name: "Mikan KenkyuuSho",
  title: "Mikan KenkyuuSho | Reisen⁴",
  description: "或许我们的日常，是由一串串奇迹连结而成的呢。",
  author: "Reisen⁴",
  keywords: ["Reisen⁴", "Animaigo", "Mikan KenkyuuSho", "个人博客", "生活记录", "二次元", "手账", "Astro"],
  nav: [
    { href: "/", label: "HOME", icon: "tabler:home-heart", hint: "front page" },
    { href: "/blog/", label: "BLOG", icon: "tabler:book-2", hint: "notes" },
    { href: "/projects/", label: "WORKS", icon: "tabler:code", hint: "projects" },
    { href: "/about/", label: "ME", icon: "tabler:user-heart", hint: "profile" }
  ]
};

export const categoryLabel: Record<string, string> = {
  tech: "随手记",
  anime: "二次元",
  life: "日常记录",
  diary: "手账"
};
