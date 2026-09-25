import { getThemePath, type ThemeId } from "@/core/themes/registry";

/**
 * 「二级页面」的返回兜底目标（没有可用的站内历史时使用）。
 * 只有存在真实父级的页面才返回目标，一级页面返回 null（不显示返回按钮）：
 * 文章 → 文章列表；Anime → Me。
 */
export function getBackTarget(themeId: ThemeId, canonicalPath: string): string | null {
  const segments = canonicalPath.split("/").filter(Boolean);

  if (segments[0] === "blog" && segments.length > 1) return getThemePath(themeId, "/blog/");
  if (segments[0] === "anime") return getThemePath(themeId, "/about/");

  return null;
}
