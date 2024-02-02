/**
 * I try to keep the `eleventy.config.js` file clean and uncluttered. Most adjustments must be made in:
 *  - `./config/collections/index.js`
 *  - `./config/filters/index.js`
 *  - `./config/plugins/index.js`
 *  - `./config/shortcodes/index.js`
 *  - `./config/transforms/index.js`
 */

// JSDoc comment: Hint VS Code for eleventyConfig autocompletion. © Henry Desroches - https://gist.github.com/xdesro/69583b25d281d055cd12b144381123bf

/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

// module import filters
const {
  toISOString,
  formatDate,
  toAbsoluteUrl,
  stripHtml,
  minifyCss,
  minifyJs,
  splitlines
} = require('./config/filters/index.js');

// module import shortcodes
const {imageShortcode, includeRaw, liteYoutube} = require('./config/shortcodes/index.js');

// module import collections
const {getAllPosts} = require('./config/collections/index.js');
const {onlyMarkdown} = require('./config/collections/index.js');
const {tagList} = require('./config/collections/index.js');

// module import events
const {svgToJpeg} = require('./config/events/index.js');

// plugins

const {EleventyRenderPlugin} = require('@11ty/eleventy');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const inclusiveLangPlugin = require('@11ty/eleventy-plugin-inclusive-language');
const bundlerPlugin = require('@11ty/eleventy-plugin-bundle');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const filters = require('./config/filters/index.js')


const markdownLib = require('./config/plugins/markdown.js');
const {slugifyString} = require('./config/utils/index.js');
const yaml = require('js-yaml');

module.exports = eleventyConfig => {
  // 	--------------------- Custom Watch Targets -----------------------
  eleventyConfig.addWatchTarget('./src/assets');
  eleventyConfig.addWatchTarget('./utils/*.js');

  // --------------------- layout aliases -----------------------
  eleventyConfig.addLayoutAlias('base', 'base.njk');
  eleventyConfig.addLayoutAlias('home', 'home.njk');
  eleventyConfig.addLayoutAlias('page', 'page.njk');
  eleventyConfig.addLayoutAlias('blog', 'blog.njk');
  eleventyConfig.addLayoutAlias('post', 'post.njk');
  eleventyConfig.addLayoutAlias('tags', 'tags.njk');

  // 	---------------------  Custom filters -----------------------

  eleventyConfig.addFilter('toIsoString', toISOString);
  eleventyConfig.addFilter('formatDate', formatDate);
  eleventyConfig.addFilter('toAbsoluteUrl', toAbsoluteUrl);
  eleventyConfig.addFilter('stripHtml', stripHtml);
  eleventyConfig.addFilter('slugify', slugifyString);
  eleventyConfig.addFilter('splitlines', splitlines);

  eleventyConfig.addFilter('cssmin', minifyCss);
  eleventyConfig.addNunjucksAsyncFilter('jsmin', minifyJs);

  eleventyConfig.addFilter('toJson', JSON.stringify);
  eleventyConfig.addFilter('fromJson', JSON.parse);

  eleventyConfig.addFilter('keys', Object.keys);
  eleventyConfig.addFilter('values', Object.values);
  eleventyConfig.addFilter('entries', Object.entries);
  
    // Filters
    eleventyConfig.addFilter('getWebmentionsForUrl', Object.keys);
    eleventyConfig.addFilter('size', Object.keys);
    eleventyConfig.addFilter('webmentionsByType', Object.keys);  
    eleventyConfig.addFilter('readableDateFromISO', Object.keys);
  
  // 	--------------------- Custom shortcodes ---------------------
  eleventyConfig.addNunjucksAsyncShortcode('eleventyImage', imageShortcode);
  eleventyConfig.addShortcode('youtube', liteYoutube);
  eleventyConfig.addShortcode('include_raw', includeRaw);
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`); // current year, stephanie eckles
  eleventyConfig.addShortcode('packageVersion', () => `v${packageVersion}`);

  // 	--------------------- Custom transforms ---------------------
  eleventyConfig.addPlugin(require('./config/transforms/html-config.js'));

  // 	--------------------- Custom Template Languages ---------------------
  eleventyConfig.addPlugin(require('./config/template-languages/css-config.js'));
  eleventyConfig.addPlugin(require('./config/template-languages/js-config.js'));

  // 	--------------------- Custom collections -----------------------
  eleventyConfig.addCollection('posts', getAllPosts);
  eleventyConfig.addCollection('onlyMarkdown', onlyMarkdown);
  eleventyConfig.addCollection('tagList', tagList);

  // 	--------------------- Events ---------------------
  eleventyConfig.on('eleventy.after', svgToJpeg);

  // 	--------------------- Plugins ---------------------
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(inclusiveLangPlugin);
  eleventyConfig.addPlugin(bundlerPlugin);
  eleventyConfig.setLibrary('md', markdownLib);

  // Add support for YAML data files with .yaml extension
  eleventyConfig.addDataExtension('yaml', contents => yaml.load(contents));

  // 	--------------------- Passthrough File Copy -----------------------
  // same path
  ['src/assets/fonts/', 'src/assets/images/template'].forEach(path =>
    eleventyConfig.addPassthroughCopy(path)
  );

  // to root
  eleventyConfig.addPassthroughCopy({
    'src/assets/images/favicon/*': '/'
  });
  
    // WEBMENTIONS FILTER
  eleventyConfig.addFilter('webmentionsForUrl', (webmentions, url) => {
    // define which types of webmentions should be included per URL.
    // possible values listed here:
    // https://github.com/aaronpk/webmention.io#find-links-of-a-specific-type-to-a-specific-page
    const allowedTypes = ['mention-of', 'in-reply-to']

    // define which HTML tags you want to allow in the webmention body content
    // https://github.com/apostrophecms/sanitize-html#what-are-the-default-options
    const allowedHTML = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        a: ['href']
      }
    }

    // clean webmention content for output
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

    // sort webmentions by published timestamp chronologically.
    // swap a.published and b.published to reverse order.
    const orderByDate = (a, b) => new Date(b.published) - new Date(a.published)

    // only allow webmentions that have an author name and a timestamp
    const checkRequiredFields = (entry) => {
      const { author, published } = entry
      return !!author && !!author.name && !!published
    }

    // run all of the above for each webmention that targets the current URL
    return webmentions
      .filter((entry) => entry['wm-target'] === url)
      .filter((entry) => allowedTypes.includes(entry['wm-property']))
      .filter(checkRequiredFields)
      .sort(orderByDate)
      .map(clean)
  })

  // 	--------------------- general config -----------------------
  return {
    // Pre-process *.md, *.html and global data files files with: (default: `liquid`)
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    // Optional (default is set): If your site deploys to a subdirectory, change `pathPrefix`, for example with with GitHub pages
    pathPrefix: '/',

    dir: {
      output: 'dist',
      input: 'src',
      includes: '_includes',
      layouts: '_layouts'
    }
  };
};
