/**
 * Copy to config.js and fill in details.
 * If your API does not allow CORS from GitHub Pages, deploy the optional
 * Cloudflare Worker (optional-proxy/cloudflare-worker.js) and use its URL here.
 */
window.APP_CONFIG = {
  // Direct GraphQL endpoint (must allow CORS for your GitHub Pages origin)

  // If using a proxy (Cloudflare Worker), put its URL here instead, e.g.:
  // GRAPHQL_ENDPOINT: "https://your-worker.your-subdomain.workers.dev/graphql",

  // Add/remove headers needed by your API:

  /**
   * Build the Google link for each topicId
   * Edit if you want a different target URL.
   */
  buildLink: (topicId) => `https://leetcode.com/discuss/post/${encodeURIComponent(topicId)}`,
};
