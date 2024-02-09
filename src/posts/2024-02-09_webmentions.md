---
title: Webmentions and 11ty
description: Getting webmentions up and running on 11ty
date: 2024-02-08
tags: ['11ty', 'eleventy', 'webmentions']
---
I have been struggling getting webmentions working on the site. It's worth noting that I don't have many yet, but I like to think I'm preparing for the future.

I found [Bob Monsour's blog post](https://www.bobmonsour.com/posts/adding-webmentions-to-my-site/) on the topic the most helpful. While your mileage may vary, I found a couple of changes helped with my flow. It's worth noting, my JS skills are not the strongest, so troubleshooting some of the issues was perhaps more difficult for me than they may be for you.

First, my _data/webmentions.js looks like this:

```js
const EleventyFetch = require("@11ty/eleventy-fetch");
require('dotenv').config()
module.exports = async function () {
  const WEBMENTIONS_STUFF = process.env.WEBMENTION_IO_TOKEN;
  const url = `https://webmention.io/api/mentions.jf2?token=${WEBMENTIONS_STUFF}&per-page=900`;
  const res = EleventyFetch(url, {
    duration: "1h",
    type: "json",
  });
  const webmentions = await res;
  return {
    mentions: webmentions.children,
  };
};
```
This adds the `require('dotenv').config()` to it. If you already trigger that elsewhere, disregard this adjustment.


Additionally, don't forget to add these to your eleventy.js (or eleventy.config.js) file.
```js
eleventyConfig.addFilter("webmentionsByUrl", webmentionsByUrl);
eleventyConfig.addFilter("plainDate", plainDate);
```

Also, make sure in the same file that your imports include webmentionsByUrl and plainDate:

```js
const {
  toISOString,
  formatDate,
  toAbsoluteUrl,
  stripHtml,
  minifyCss,
  minifyJs,
  splitlines,
  webmentionsByUrl,
  plainDate
} = require('./config/filters/index.js');
```

AND that your filters/index.js file includes the same exports:

```js
module.exports = {
  toISOString,
  formatDate,
  toAbsoluteUrl,
  stripHtml,
  minifyCss,
  minifyJs,
  splitlines,
  webmentionsByUrl,
  plainDate
  };
```
With those, I was able to get webmentions working. You'll see a couple of my own tests on [this post](https://stuff.reddmo.com/blog/the-human-touch-denouncing-the-use-of-ai-in-blog-writing/). It was a frustrating road to get to this point but worth it.