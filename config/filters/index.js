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

const sanitizeHTML = require('sanitize-html')



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
  isOwnWebmention: function (webmention) {
        const urls = [
            'https://itc.reddmo.com',
            'https://hachyderm.io/@jasonmoser'
        ]
        const authorUrl = webmention.author ? webmention.author.url : false
        // check if a given URL is part of this site.
        return authorUrl && urls.includes(authorUrl)
    },

    webmentionsByUrl: function (webmentions, url) {
        const allowedTypes = ['mention-of', 'in-reply-to']
        const allowedHTML = {
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: {
                a: ['href']
            }
        }

        const orderByDate = (a, b) =>
            new Date(a.published) - new Date(b.published)

        const checkRequiredFields = (entry) => {
            const { author, published, content } = entry
            return !!author && !!author.name && !!published && !!content
        }

        const clean = (entry) => {
            const { html, text } = entry.content

            if (html) {
                // really long html mentions, usually newsletters or compilations
                entry.content.value =
                    html.length > 2000
                        ? `mentioned this in <a href="${entry['wm-source']}">${entry['wm-source']}</a>`
                        : sanitizeHTML(html, allowedHTML)
            } else {
                entry.content.value = sanitizeHTML(text, allowedHTML)
            }

            return entry
        }

        return webmentions
            .filter((entry) => entry['wm-target'] === url)
            .filter((entry) => allowedTypes.includes(entry['wm-property']))
            .filter(checkRequiredFields)
            .sort(orderByDate)
            .map(clean)
    },

    webmentionCountByType: function (webmentions, url, ...types) {
        const isUrlMatch = (entry) =>
            entry['wm-target'] === url ||
            entry['wm-target'] === url.replace('mxb.dev', 'mxb.at')

        return String(
            webmentions
                .filter(isUrlMatch)
                .filter((entry) => types.includes(entry['wm-property'])).length
        )
    },

    excludePost: function (allPosts, currentPost) {
        return allPosts.filter(
            (post) => post.inputPath !== currentPost.inputPath
        )
    },

    currentPage: function (allPages, currentPage) {
        const matches = allPages.filter(
            (page) => page.inputPath === currentPage.inputPath
        )
        if (matches && matches.length) {
            return matches[0]
        }
        return null
    },

    excerpt: function (content) {
        const excerptMinimumLength = 80
        const excerptSeparator = '<!--more-->'
        const findExcerptEnd = (content) => {
            if (content === '') {
                return 0
            }

            const paragraphEnd = content.indexOf('</p>', 0) + 4
            if (paragraphEnd < excerptMinimumLength) {
                return (
                    paragraphEnd +
                    findExcerptEnd(
                        content.substring(paragraphEnd),
                        paragraphEnd
                    )
                )
            }

            return paragraphEnd
        }

        if (!content) {
            return
        }

        if (content.includes(excerptSeparator)) {
            return content.substring(0, content.indexOf(excerptSeparator))
        } else if (content.length <= excerptMinimumLength) {
            return content
        }

        const excerptEnd = findExcerptEnd(content)
        return content.substring(0, excerptEnd)
    },
};
