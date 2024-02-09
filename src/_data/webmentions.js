const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
  const WEBMENTIONS_BOBM = process.env.WEBMENTION_IO_TOKEN;
  const url = `https://webmention.io/api/mentions.jf2?token=FxpDShtq3FIvJ1_BONV1tg&per-page=900`;
  const res = EleventyFetch(url, {
    duration: "1h",
    type: "json",
  });
  const webmentions = await res;
  return {
    mentions: webmentions.children,
  };
};