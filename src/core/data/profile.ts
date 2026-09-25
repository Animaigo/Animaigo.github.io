export const profileIdentity = {
  displayName: "Reisen⁴",
  handle: "Reisen⁴",
  siteName: "Mikan KenkyuuSho",
  bio: "或许我们的日常，是由一串串奇迹连结而成的呢。",
  // 社交链接只在这里维护：首页英雄区、Me 页 Profile README、Blank 的 About 共用，留空即隐藏。
  github: "https://github.com/Animaigo",
  bilibili: "https://space.bilibili.com/23345964",
  bangumi: "https://bgm.tv/user/1028220"
} as const;

export const profileStatus = [
  "正在慢慢收拾这个房间",
  "想把日常里的小小奇迹都记下来",
  "欢迎来串门"
] as const;

// 这里按自己真实情况填写即可；不用的项留空数组，About 页会自动隐藏对应区块。
export const profileTech = [
  // 例：{ key: "cooking", name: "做饭", note: "慢慢练习中" }
] satisfies Array<{ key: string; name: string; note: string }>;

export const animeFavorites = [
  // 例：{ key: "touhou", title: "东方 Project", subtitle: "Touhou Project" }
  // 填写后把对应图片放到 public/themes/fuyukawa-kagari/assets/about/<key>.webp
] satisfies Array<{ key: string; title: string; subtitle: string }>;

export const xpFavorites = [
  // 例：{ key: "rabbit", title: "月兔", subtitle: "moon rabbit" }
] satisfies Array<{ key: string; title: string; subtitle: string }>;

export const favoriteGames = [
  // 例：{ key: "game-name", title: "游戏名", subtitle: "English title" }
] satisfies Array<{ key: string; title: string; subtitle: string }>;

export const currentSignals = [
  { label: "这里写什么", text: "日常、喜欢的东西，和生活里那些值得存档的微小奇迹。" },
  { label: "最近在做", text: "慢慢把这个小房间收拾成自己喜欢的样子。" },
  { label: "今日电波", text: "想写就写，开心就好。" }
] as const;
