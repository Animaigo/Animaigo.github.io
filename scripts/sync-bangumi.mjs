import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "src/core/data/bangumi.json");
const rawDumpFile = path.join(root, "tmp/bangumi-raw.json");
const coverDir = path.join(root, "public/bangumi");

const USER_AGENT = "mikan-fuyukawa-blog/0.1 (https://github.com/Animaigo)";
const PAGE_SIZE = 50;
const SUBJECT_TYPE_ANIME = 2;

// Bangumi 收藏状态：1 想看 / 2 看过 / 3 在看 / 4 搁置 / 5 抛弃
const STATUS_BY_TYPE = {
  1: "wish",
  2: "completed",
  3: "watching",
  4: "onhold",
  5: "dropped"
};

const STATUS_ORDER = { watching: 0, completed: 1, wish: 2, onhold: 3, dropped: 4 };

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const fromFiles = args
  .filter((arg) => arg.startsWith("--from-file="))
  .map((arg) => arg.slice("--from-file=".length))
  .filter(Boolean);
const uidFlag = args.find((arg) => arg.startsWith("--uid="));
const uid = uidFlag ? uidFlag.slice("--uid=".length) : args.find((arg) => !arg.startsWith("--"));
const allCovers = flags.has("--all-covers");
const skipCovers = flags.has("--no-covers");
const dryRun = flags.has("--dry-run");

if (!uid && !fromFiles.length) {
  console.error("用法: node --use-env-proxy scripts/sync-bangumi.mjs <bangumi-uid> [--all-covers]");
  console.error("      node scripts/sync-bangumi.mjs --from-file=<保存好的 JSON> [--from-file=...] [--no-covers]");
  console.error("提示 1: 先开代理，再带上项目目录（在任意目录都能跑，路径要用引号）：");
  console.error('  $env:HTTPS_PROXY="http://127.0.0.1:7890"');
  console.error('  node --use-env-proxy "C:\\Users\\luosh\\Documents\\ChatGPT\\Codx project\\fuyukawa-blog\\scripts\\sync-bangumi.mjs" <uid>');
  console.error("提示 2: 或者先 cd 进项目目录再 npm 运行（npm 需要能找到 package.json）：");
  console.error('  cd "C:\\Users\\luosh\\Documents\\ChatGPT\\Codx project\\fuyukawa-blog"');
  console.error("  npm run sync:bangumi -- <uid>");
  console.error("提示 3: 如果 Node 走代理仍失败，用 curl 存成文件再离线解析：");
  console.error('  curl.exe -x http://127.0.0.1:7890 -A "mikan-fuyukawa-blog/0.1" "https://api.bgm.tv/user/<uid>/collection?cat=anime" -o bgm.json');
  console.error('  node "...\\sync-bangumi.mjs" --from-file=bgm.json');
  console.error("可选参数: --all-covers 下载全部封面 / --no-covers 不下载 / --dry-run 只解析不写文件");
  process.exit(1);
}

const request = async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${url}`);
  }
  return response.json();
};

async function fetchV0Collections(userId) {
  const items = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;
  while (offset < total) {
    const page = await request(
      `https://api.bgm.tv/v0/users/${encodeURIComponent(userId)}/collections` +
        `?subject_type=${SUBJECT_TYPE_ANIME}&limit=${PAGE_SIZE}&offset=${offset}`
    );
    const data = Array.isArray(page?.data) ? page.data : [];
    total = Number(page?.total ?? data.length);
    items.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return items;
}

async function fetchLegacyCollections(userId) {
  const data = await request(`https://api.bgm.tv/user/${encodeURIComponent(userId)}/collection?cat=anime`);
  return Array.isArray(data) ? data : [];
}

function normalize(entry) {
  const subject = entry?.subject ?? {};
  const id = Number(entry?.subject_id ?? subject?.id);
  if (!id) return null;

  const status = STATUS_BY_TYPE[Number(entry?.type)] ?? "wish";
  const images = subject?.images ?? {};
  // 优先取大图：medium(800) → common(400) → large → small → grid(100)
  const cover = images.medium || images.common || images.large || images.small || images.grid || "";

  return {
    id,
    name: subject?.name ?? "",
    nameCn: subject?.name_cn ?? "",
    status,
    score: Number(entry?.rate ?? 0) || 0,
    progress: Number(entry?.ep_status ?? 0) || 0,
    total: Number(subject?.eps ?? subject?.total_episodes ?? 0) || 0,
    date: subject?.date ?? "",
    cover,
    url: `https://bgm.tv/subject/${id}`
  };
}

async function downloadCover(item) {
  if (!item.cover) return;
  const target = path.join(coverDir, `${item.id}.webp`);
  try {
    const response = await fetch(item.cover, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) throw new Error(`${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(target);
    item.cover = `/bangumi/${item.id}.webp`;
  } catch (error) {
    console.warn(`  ! 封面下载失败 #${item.id}: ${error.message}（保留远程地址）`);
  }
}

async function main() {
  let rawEntries = [];
  let preNormalized = [];
  let source;

  if (fromFiles.length) {
    console.log(`从本地文件解析：${fromFiles.join(", ")}`);
    for (const file of fromFiles) {
      const parsed = JSON.parse(await readFile(path.resolve(process.cwd(), file), "utf8"));
      if (Array.isArray(parsed)) {
        rawEntries.push(...parsed);
      } else if (Array.isArray(parsed?.data)) {
        rawEntries.push(...parsed.data);
      } else if (Array.isArray(parsed?.rawEntries)) {
        rawEntries.push(...parsed.rawEntries);
      } else if (Array.isArray(parsed?.items)) {
        preNormalized.push(...parsed.items.filter((item) => item?.id && item?.status));
      } else {
        throw new Error(`无法识别的 JSON 结构：${file}（既不是数组，也没有 data/items 字段）`);
      }
    }
    source = "file";
  } else {
    console.log(`同步 Bangumi 追番：uid=${uid}`);
    try {
      rawEntries = await fetchV0Collections(uid);
      source = "v0";
    } catch (error) {
      console.warn(`v0 接口失败（${error.message}），改用旧版收藏接口。`);
      rawEntries = await fetchLegacyCollections(uid);
      source = "legacy";
    }
  }

  const byId = new Map();
  for (const item of [...preNormalized, ...rawEntries.map(normalize).filter(Boolean)]) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  const items = [...byId.values()].sort(
    (a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (b.score - a.score) || a.id - b.id
  );

  if (!items.length) {
    console.warn("没有拿到任何收藏条目：请确认 UID 正确、且该账号有动画收藏。");
  }

  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  if (dryRun) {
    console.log(`[dry-run] 解析到 ${items.length} 部`, counts);
    console.log("[dry-run] 未写入任何文件、未下载封面。");
    return;
  }

  await mkdir(coverDir, { recursive: true });
  await mkdir(path.dirname(rawDumpFile), { recursive: true });
  await writeFile(rawDumpFile, JSON.stringify({ source, uid, fetchedAt: new Date().toISOString(), rawEntries }, null, 2));

  const withCover = skipCovers
    ? []
    : items.filter(
        (item) =>
          item.cover && !item.cover.startsWith("/") && (allCovers || item.status === "watching")
      );
  if (withCover.length) {
    console.log(`下载 ${withCover.length} 张封面…`);
    for (const item of withCover) {
      await downloadCover(item);
    }
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    user: { uid: uid ? String(uid) : "", nickname: "" },
    items
  };
  await writeFile(dataFile, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`完成：共 ${items.length} 部（接口 ${source}）`, counts);
  console.log(`数据写入 ${path.relative(root, dataFile)}；原始响应备份在 ${path.relative(root, rawDumpFile)}。`);
}

await main();
