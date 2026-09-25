export interface FriendLink {
  name: string;
  url: string;
  /** 头像：public 下的绝对路径或外链；留空则用名字首字占位 */
  avatar?: string;
  /** 一句话简介；留空则只显示名字 */
  description?: string;
}

// 友链数据源：Fuyukawa 的 Me 页与 Blank 的 About 页共用。
export const friendLinks: FriendLink[] = [
  {
    name: "Elysia",
    url: "https://seele.wiki",
    avatar: "/friends/seele-wiki.webp"
  }
];
