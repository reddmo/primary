const dayjs = require('dayjs');
const CleanCSS = require('clean-css');
const site = require('../../src/_data/meta');
const {throwIfNotType} = require('../utils');
const esbuild = require('esbuild');

/** Removes all tags from an HTML string. */
const stripHtml = str => {
  throwIfNotType(str, 'string');
  return str.replace(/<[^>]+>/g, '');
};

/** Formats the given string as an absolute url. */
const toAbsoluteUrl = url => {
  throwIfNotType(url, 'string');
  // Replace trailing slash, e.g., site.com/ => site.com
  const siteUrl = site.url.replace(/\/$/, '');
  // Replace starting slash, e.g., /path/ => path/
  const relativeUrl = url.replace(/^\//, '');

  return `${siteUrl}/${relativeUrl}`;
};

/** Converts the given date string to ISO8610 format. */
const toISOString = dateString => dayjs(dateString).toISOString();


const sanitizeHTML = require("sanitize-html");
const webmentionsByUrl = (webmentions, url) => {
  const allowedTypes = {
    likes: ["like-of"],
    reposts: ["repost-of"],
    comments: ["mention-of", "in-reply-to"],
  };

  const sanitize = (entry) => {
    if (entry.content && entry.content.html) {
      entry.content = sanitizeHTML(entry.content.html, {
        allowedTags: ["b", "i", "em", "strong", "a"],
      });
    }
    return entry;
  };

  const pageWebmentions = webmentions
    .filter(
      (mention) => mention["wm-target"] === "https://stuff.reddmo.com" + url
    )
    .sort((a, b) => new Date(b.published) - new Date(a.published))
    .map(sanitize);
  // console.log("pageWebmentions: ", pageWebmentions);

  const likes = pageWebmentions
    .filter((mention) => allowedTypes.likes.includes(mention["wm-property"]))
    .filter((like) => like.author)
    .map((like) => like.author);
  // console.log(JSON.stringify(likes, null, 2));

  const reposts = pageWebmentions
    .filter((mention) => allowedTypes.reposts.includes(mention["wm-property"]))
    .filter((repost) => repost.author)
    .map((repost) => repost.author);

  const comments = pageWebmentions
    .filter((mention) => allowedTypes.comments.includes(mention["wm-property"]))
    .filter((comment) => {
      const { author, published, content } = comment;
      return author && author.name && published && content;
    });
  // console.log(JSON.stringify(comments, null, 2));

  const mentionCount = likes.length + reposts.length + comments.length;
  const data = { likes, reposts, comments, mentionCount };
  return data;
};


// create a plain date from an ISO date (for webmentions)
const plainDate = (isoDate) => {
  let date = new Date(isoDate);
  let options = { year: "numeric", month: "long", day: "numeric" };
  let formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
};

/** Formats a date using dayjs's conventions: https://day.js.org/docs/en/display/format */
const formatDate = (date, format) => dayjs(date).format(format);

const minifyCss = code => new CleanCSS({}).minify(code).styles;

const minifyJs = async (code, ...rest) => {
  const callback = rest.pop();
  const cacheKey = rest.length > 0 ? rest[0] : null;

  try {
    if (cacheKey && jsminCache.hasOwnProperty(cacheKey)) {
      const cacheValue = await Promise.resolve(jsminCache[cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
      callback(null, cacheValue.code); // Access the code property of the cached value
    } else {
      const minified = esbuild.transform(code, {
        minify: true
      });
      if (cacheKey) {
        jsminCache[cacheKey] = minified; // Store the promise which has the minified output (an object with a code property)
      }
      callback(null, (await minified).code); // Await and use the return value in the callback
    }
  } catch (err) {
    console.error('jsmin error: ', err);
    callback(null, code); // Fail gracefully.
  }
};


// source: https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/.eleventy.js
const splitlines = (input, maxCharLength) => {
  const parts = input.split(' ');
  const lines = parts.reduce(function (acc, cur) {
    if (!acc.length) {
      return [cur];
    }

    let lastOne = acc[acc.length - 1];

    if (lastOne.length + cur.length > maxCharLength) {
      return [...acc, cur];
    }

    acc[acc.length - 1] = lastOne + ' ' + cur;

    return acc;
  }, []);

  return lines;
};

module.exports = {
  toISOString,
  formatDate,
  toAbsoluteUrl,
  stripHtml,
  minifyCss,
  minifyJs,
  splitlines,
  webmentionsByUrl
  };
