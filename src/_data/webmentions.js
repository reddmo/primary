const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const ITC = process.env.WEBMENTION_IO_TOKEN
  const url = `https://webmention.io/api/mentions.jf2?token=${ITC}&per-page=1000`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  })
  const webmentions = await res
  return {
    mentions: webmentions.children,
  }
}