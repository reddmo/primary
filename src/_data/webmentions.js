// Fetch webmentions from webmention.io API
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
  const WEBMENTIONS_STUFF = process.env.WEBMENTION_IO_TOKEN;
  const url = `https://webmention.io/api/mentions.jf2?token=${WEBMENTIONS_STUFF}&per-page=900`;
  const res = EleventyFetch(url, {
    duration: "1h",
    type: "json",
  });
  const webmentions = await res;
  // console.log(JSON.stringify(webmentions, null, 2));
  return {
    mentions: webmentions.children,
  };
};