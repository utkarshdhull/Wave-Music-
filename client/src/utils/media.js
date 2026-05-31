const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

export function resolveMediaUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/api") || url.startsWith("/uploads")) {
    return `${apiOrigin}${url}`;
  }

  return url;
}

