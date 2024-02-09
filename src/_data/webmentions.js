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