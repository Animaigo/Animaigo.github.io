---
title: "给这个房间的第一页"
description: "Mikan KenkyuuSho 的第一篇草稿：说明怎么写文章，写完删除这一页即可。"
pubDate: 2026-09-01
tags: ["日常", "手账"]
category: "life"
draft: true
---

在 `src/content/blog/` 新建 `.md` 文件就能写文章。

最简格式：

```md
---
title: "文章标题"
description: "一句话摘要"
pubDate: 2026-09-05
tags: ["日常"]
category: "life"
---

正文内容。
```

可选字段：`seoTitle`、`seoDescription`、`seoKeywords`、`updatedDate`、`cover`。
`category` 目前支持 `life`（日常）、`diary`（手账）、`anime`（二次元）、`tech`（随手记）。
`draft: true` 时文章不会出现在正式列表里。

写完把这一页删掉，然后把属于你的第一篇文章放进来吧。
