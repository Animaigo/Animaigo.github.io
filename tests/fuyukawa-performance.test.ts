import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const readSource = (relativePath: string) => readFileSync(
  fileURLToPath(new URL(`../${relativePath}`, import.meta.url)),
  "utf8"
);

const layoutSource = readSource("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");
const homeSource = readSource("src/themes/fuyukawa-kagari/pages/HomePage.astro");
const aboutSource = readSource("src/themes/fuyukawa-kagari/pages/AboutPage.astro");
const blankAboutSource = readSource("src/themes/blank/pages/AboutPage.astro");
const blankAnimeSource = readSource("src/themes/blank/pages/AnimePage.astro");
const animePageSource = readSource("src/themes/fuyukawa-kagari/pages/AnimePage.astro");
const blankThemeSource = readSource("src/themes/blank/styles/theme.css");
const blankLayoutSource = readSource("src/themes/blank/layouts/BlankLayout.astro");
const backTargetSource = readSource("src/core/navigation/backTarget.ts");
const articleLayoutSource = readSource("src/themes/fuyukawa-kagari/layouts/ArticleLayout.astro");
const friendsSource = readSource("src/core/data/friends.ts");
const blogIndexSource = readSource("src/themes/fuyukawa-kagari/pages/BlogIndexPage.astro");
const colorModeSource = readSource("src/core/ColorMode.astro");
const quickActionsSource = readSource("src/core/QuickActions.astro");
const astroConfigSource = readSource("astro.config.mjs");
const animeRouteSource = readSource("src/pages/anime.astro");
const blankAnimeRouteSource = readSource("src/pages/themes/blank/anime.astro");
const profileSource = readSource("src/core/data/profile.ts");
const bangumiSource = readSource("src/core/data/bangumi.ts");
const syncBangumiSource = readSource("scripts/sync-bangumi.mjs");
const packageSource = readSource("package.json");
const themeSource = readSource("src/themes/fuyukawa-kagari/styles/theme.css");
const readingRailSource = readSource("src/core/ReadingRail.astro");
const projectsPageSource = readSource("src/themes/fuyukawa-kagari/pages/ProjectsPage.astro");
const projectsDataSource = readSource("src/core/data/projects.ts");
const blankProjectsPageSource = readSource("src/themes/blank/pages/ProjectsPage.astro");

test("Fuyukawa defers external Live2D work to idle or explicit intent", () => {
  assert.match(layoutSource, /const scheduleLive2dWidget =/);
  assert.match(layoutSource, /canAutoInitLive2d/);
  assert.match(layoutSource, /requestIdleCallback\(start, \{ timeout: 3200 \}\)/);
  assert.match(layoutSource, /scheduleLive2dWidget\(\);/);
  assert.match(layoutSource, /live2dToggle\?\.addEventListener\("click"/);
  assert.match(layoutSource, /initLive2dWidget\(\);/);
  assert.match(layoutSource, /const live2dResources = new Map\(\)/);
});

test("Fuyukawa bounds and defers location and weather requests", () => {
  assert.match(homeSource, /const scheduleHomeWeather =/);
  assert.match(homeSource, /locationCacheTtl = 1000 \* 60 \* 60 \* 12/);
  assert.match(homeSource, /fetchWithTimeout\(weatherUrl, \{\}, 4500, signal\)/);
  // 原站的腾讯地图接口（含外来的 key）已移除，定位只走 ipwho.is
  assert.doesNotMatch(homeSource, /apis\.map\.qq\.com|tencentMapKey/);
  assert.match(homeSource, /performanceProfile === "full" && !constrainedNetwork/);
  assert.match(homeSource, /connection\?\.saveData/);
  assert.doesNotMatch(homeSource, /getPconlineIpLocation|getTencentNewsIpLocation/);
});

test("Fuyukawa pauses the second-by-second clock while hidden", () => {
  assert.match(homeSource, /const scheduleHomeClock =/);
  assert.match(homeSource, /document\.visibilityState !== "visible"/);
  assert.match(homeSource, /document\.addEventListener\("visibilitychange", handleClockVisibility\)/);
  assert.doesNotMatch(homeSource, /setInterval\(updateHomeClock, 1000\)/);
});

test("Fuyukawa pins the primary nav once the home content background fills the viewport", () => {
  assert.match(homeSource, /const syncNavPin = \(\) => \{/);
  assert.match(
    homeSource,
    /siteHeader\.classList\.toggle\("is-nav-pinned", homeContentBg\.getBoundingClientRect\(\)\.top <= 60\)/
  );
  assert.match(homeSource, /window\.requestAnimationFrame\(syncNavPin\)/);
  assert.match(homeSource, /window\.addEventListener\("scroll", scheduleNavPin, \{ passive: true \}\)/);
  assert.match(homeSource, /siteHeader\.classList\.remove\("is-nav-pinned"\)/);
  assert.match(themeSource, /\.site-header\.is-nav-pinned \{\s*top: 0;/);
});

test("Fuyukawa only gives the home surface the cover background", () => {
  assert.match(layoutSource, /surface\?: "cover" \| "page";/);
  assert.match(layoutSource, /surface = "page"/);
  assert.match(layoutSource, /surface === "cover" \? "has-cover-surface" : "has-page-surface"/);
  assert.match(homeSource, /<BaseLayout surface="cover">/);
  assert.match(
    themeSource,
    /body\.has-page-surface \{[\s\S]*?linear-gradient\(180deg, rgba\(255, 248, 236, 0\.44\), rgba\(255, 248, 236, 0\.72\) 42%, rgba\(255, 248, 236, 0\.58\)\)[\s\S]*?fuyukawa-kagari-bg\.webp"\) center bottom \/ cover no-repeat fixed;/
  );
});

test("Fuyukawa single-sources social links and ships motion with reduced-motion fallbacks", () => {
  assert.match(profileSource, /bilibili: "https:\/\/space\.bilibili\.com\/23345964"/);
  assert.match(profileSource, /bangumi: "https:\/\/bgm\.tv\/user\/1028220"/);
  assert.match(homeSource, /<a href=\{profileIdentity\.github\}/);
  assert.match(homeSource, /<a href=\{profileIdentity\.bilibili\}/);
  assert.match(homeSource, /<a href=\{profileIdentity\.bangumi\}/);
  assert.match(aboutSource, /href=\{profileIdentity\.bilibili\}/);
  assert.match(aboutSource, /href=\{profileIdentity\.bangumi\}/);
  assert.match(blankAboutSource, /href=\{profileIdentity\.bangumi\}/);
  assert.match(themeSource, /--ease-out: cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(themeSource, /\.music-controls button:active/);
  assert.match(themeSource, /#waifu\.is-summoned/);
  assert.match(themeSource, /\.blog-search-results\.is-entering \.blog-search-result/);
  assert.match(themeSource, /animation-name: search-result-fade/);
});

test("Bangumi sync, data module and both theme surfaces stay wired", () => {
  assert.match(bangumiSource, /watching: "在看"/);
  assert.match(bangumiSource, /bangumiDisplayName/);
  assert.match(syncBangumiSource, /https:\/\/api\.bgm\.tv\/v0\/users\//);
  assert.match(syncBangumiSource, /https:\/\/api\.bgm\.tv\/user\//);
  assert.match(syncBangumiSource, /User-Agent/);
  assert.match(packageSource, /"sync:bangumi"/);
  assert.match(aboutSource, /me-more-link/);
  assert.match(aboutSource, /getThemePath\("fuyukawa-kagari", "\/anime\/"\)/);
  assert.match(blankAboutSource, /blank-link-row/);
  assert.match(blankAboutSource, /getThemePath\("blank", "\/anime\/"\)/);
  assert.match(blankAnimeSource, /blank-anime-inline/);
  assert.match(blankAboutSource, /profileTech\.length > 0/);
  assert.match(animePageSource, /\["completed", "wish", "onhold", "dropped"\]/);
  assert.match(animePageSource, /\.anime-inline \{/);
  assert.match(animePageSource, /anime-inline-sep/);
  assert.match(animePageSource, /\.anime-hero \{\s*max-width: none;/);
  assert.match(aboutSource, /\.me-more-link:hover \{[\s\S]{0,120}background:/);
  assert.match(aboutSource, /\.about-link-row a:hover/);
  assert.match(blankThemeSource, /\.blank-link-row:hover \{[\s\S]{0,120}background:/);
  assert.match(blankThemeSource, /\.blank-actions a:hover/);
  assert.match(aboutSource, /transition:name="anime-title"/);
  assert.match(animePageSource, /transition:name="anime-title"/);
  assert.match(themeSource, /::view-transition-group\(anime-title\)/);
  assert.match(blankThemeSource, /@view-transition \{\s*navigation: auto;/);
  assert.match(blankThemeSource, /view-transition-name: anime-title/);
  assert.match(layoutSource, /import BackButton from "@\/core\/navigation\/BackButton.astro"/);
  assert.match(layoutSource, /\{\s*backTarget && \(/);
  assert.match(blankLayoutSource, /\{\s*backTarget && \(/);
  assert.match(backTargetSource, /string \| null/);
  assert.match(backTargetSource, /return null;/);
  assert.match(backTargetSource, /segments\[0\] === "blog" && segments\.length > 1/);
  assert.match(backTargetSource, /segments\[0\] === "anime"/);
  assert.doesNotMatch(articleLayoutSource, /回到文章列表/);
  assert.match(themeSource, /\.back-button \{/);
  assert.match(blankThemeSource, /\.back-button \{/);
  assert.match(layoutSource, /data-visit-total/);
  assert.match(layoutSource, /data-visit-today/);
  assert.match(layoutSource, /abacus\.jasoncameron\.dev/);
  assert.match(layoutSource, /isLocalVisitHost/);
  assert.doesNotMatch(layoutSource, /旅行者一号/);
  assert.match(themeSource, /\.footer-counter/);
  assert.match(friendsSource, /url: "https:\/\/seele\.wiki"/);
  assert.match(friendsSource, /avatar: "\/friends\/seele-wiki\.webp"/);
  assert.match(aboutSource, /\.friend-grid \{/);
  assert.match(aboutSource, /friendLinks\.length > 0/);
  assert.match(blankAboutSource, /blank-friend-list/);
  assert.match(blankThemeSource, /\.blank-friend-row:hover/);
  assert.doesNotMatch(blogIndexSource, /AstrBot/);
  assert.match(blogIndexSource, /placeholder="输入关键词…"/);
  assert.doesNotMatch(animePageSource, /<small>\{item\.name\}<\/small>/);
  assert.doesNotMatch(blankAnimeSource, /<small>\{item\.name\}<\/small>/);
  assert.match(bangumiSource, /wish: 2/);
  assert.match(bangumiSource, /onhold: 3/);
  assert.match(animeRouteSource, /AnimePage/);
  assert.match(blankAnimeRouteSource, /AnimePage/);
});

test("Dark mode preference and the quick action cluster stay wired", () => {
  assert.match(colorModeSource, /mikan-color-mode-v1/);
  assert.match(colorModeSource, /prefers-color-scheme: dark/);
  assert.match(colorModeSource, /root\.dataset\.colorMode = resolved/);
  assert.match(colorModeSource, /data-color-mode-toggle/);
  assert.match(colorModeSource, /data-astro-rerun/);
  assert.match(colorModeSource, /document\.addEventListener\("astro:after-swap", apply\)/);
  assert.match(colorModeSource, /apply\(\);\s*\n\s*if \(window\.__mikanColorMode\) return;/);
  assert.match(layoutSource, /<ColorMode \/>/);
  assert.match(layoutSource, /<QuickActions themeTarget="blank"/);
  assert.match(blankLayoutSource, /<ColorMode \/>/);
  assert.match(blankLayoutSource, /<QuickActions themeTarget="fuyukawa-kagari"/);
  assert.match(quickActionsSource, /data-quick-actions-menu/);
  assert.match(quickActionsSource, /data-quick-actions-handle/);
  assert.match(quickActionsSource, /is-pinned/);
  assert.match(themeSource, /html\[data-color-mode="dark"\] \{/);
  assert.match(blankThemeSource, /html\[data-color-mode="dark"\] \{/);
  assert.match(themeSource, /\.quick-actions:hover \.quick-actions-menu/);
  assert.match(themeSource, /\.quick-actions\.is-pinned \.quick-actions-menu/);
  assert.match(blankThemeSource, /\.quick-actions\.is-pinned \.quick-actions-menu/);
  assert.match(themeSource, /\.quick-actions\.is-collapsed \.quick-actions-menu/);
  assert.match(blankThemeSource, /\.quick-actions\.is-collapsed \.quick-actions-menu/);
  // 胶囊底：收起时只罩住把手，展开时放开裁剪
  assert.match(themeSource, /\.quick-actions::before \{/);
  assert.match(themeSource, /clip-path: inset\(0 0 0 calc\(100% - 52px\) round 999px\)/);
  assert.match(themeSource, /\.quick-actions:hover::before,[^]*clip-path: inset\(0 0 0 0 round 999px\)/);
  assert.match(themeSource, /html\[data-color-mode="dark"\] \.quick-actions::before/);
  // Blank 侧同一套胶囊
  assert.match(blankThemeSource, /\.quick-actions::before \{/);
  assert.match(blankThemeSource, /clip-path: inset\(0 0 0 calc\(100% - 50px\) round 999px\)/);
  assert.match(themeSource, /深色下的悬停/);
  assert.match(themeSource, /about-activity-grid article/);
  assert.match(themeSource, /music-control-label/);
  assert.match(colorModeSource, /is-color-mode-switching/);
  assert.match(themeSource, /is-color-mode-switching::view-transition-group/);
  assert.match(blankThemeSource, /is-color-mode-switching::view-transition-group/);
  assert.doesNotMatch(themeSource, /data-color-mode="dark"\] \.hero-stage,/);
  assert.match(quickActionsSource, /touchOnly/);
  // 点开就固定住：指针移开时不再取消钉住，抑制态只等指针重新进入才撤
  assert.match(quickActionsSource, /quickActionsLeft/);
  assert.doesNotMatch(quickActionsSource, /pointerType === "mouse"/);
  // 展开只认键盘焦点：鼠标点完残留的 :focus 不能把胶囊一直撑着
  assert.match(themeSource, /\.quick-actions:has\(:focus-visible\) \.quick-actions-menu/);
  assert.match(blankThemeSource, /\.quick-actions:has\(:focus-visible\) \.quick-actions-menu/);
  assert.doesNotMatch(themeSource, /\.quick-actions:focus-within/);
  assert.doesNotMatch(blankThemeSource, /\.quick-actions:focus-within/);
  assert.match(blankThemeSource, /\.blank-actions a:first-child \{[\s\S]{0,120}#12151c/);
});

test("Reading rail and project mosaic live in shared files, not preview pages", () => {
  // 正式文章页与预览页共用同一个组件
  assert.match(readingRailSource, /data-reader-bars/);
  assert.match(readingRailSource, /data-reader-hover-label/);
  assert.match(readingRailSource, /reader-bar--h\$\{mark\.depth\}/);
  assert.match(readingRailSource, /reader-bar--tick/);
  assert.match(readingRailSource, /prefers-reduced-motion/);
  // 横条落在文章栏左边的空档里
  assert.match(readingRailSource, /rect\.left - 48/);
  assert.match(readingRailSource, /reader-top-progress/);
  // 样式住在 theme.css（全局），不会再踩 scoped 的坑
  assert.match(themeSource, /\.reader-rail \{/);
  assert.match(themeSource, /\.reader-bar--h2 \{\n  width: 17px;/);
  assert.match(themeSource, /\.reader-bar\.is-current \{/);
  // 悬停的竖条标记已经取消
  assert.doesNotMatch(themeSource, /reader-hover-band/);
  // 两个预览页已经删掉，sitemap 过滤与 noindex 开关一并收掉
  assert.match(astroConfigSource, /return !pathname\.startsWith\("\/themes\/"\);/);
  assert.doesNotMatch(astroConfigSource, /preview/);
  // 主题备用路由仍然带 noindex,follow；被收掉的是那个给预览页用的 noindex 开关
  assert.doesNotMatch(layoutSource, /noindex\?: boolean/);
  assert.match(layoutSource, /isAlternateThemeRoute && <meta name="robots" content="noindex,follow" \/>/);
});

test("Article layout and projects page consume the shared rail and mosaic", () => {
  // 文章页：接上阅读条、撤掉静态目录、正文单栏居中
  assert.match(articleLayoutSource, /import ReadingRail from "@\/core\/ReadingRail\.astro"/);
  assert.match(articleLayoutSource, /data-reader-article/);
  assert.match(articleLayoutSource, /<ReadingRail \/>/);
  assert.doesNotMatch(articleLayoutSource, /article-toc/);
  assert.match(themeSource, /\.article-shell \{\n  \/\*[^]*?width: min\(860px, calc\(100% - 32px\)\)/);
  // 正文 h2 的竖条与标题之间多留一个空格
  assert.match(themeSource, /\.prose h2 \{[^}]*padding: 4px 0 8px 24px/);
  // 项目页：拼贴 + 详情面板搬进正式页，数据来自 projects.ts
  assert.match(projectsPageSource, /import \{ projectEntries \} from "@\/core\/data\/projects"/);
  assert.match(projectsPageSource, /mosaic-card--\$\{project\.size\}/);
  assert.match(projectsPageSource, /project-overlay/);
  assert.match(projectsPageSource, /id="project-data"/);
  assert.match(projectsPageSource, /const buildDetail =/);
  assert.match(projectsPageSource, /is-project-closing/);
  assert.match(themeSource, /\.project-sheet \{/);
  assert.match(themeSource, /aspect-ratio: var\(--project-hero-ratio, 16 \/ 9\)/);
  assert.match(themeSource, /html\.is-project-open,\nbody\.is-project-open \{\n  overflow: hidden;/);
  // 数据源新结构
  assert.match(projectsDataSource, /export interface ProjectEntry/);
  assert.match(projectsDataSource, /links: Array<\{ label: string; href: string \}>/);
  // Blank 主题跟着新字段走
  assert.match(blankProjectsPageSource, /project\.tags\.map/);
});
