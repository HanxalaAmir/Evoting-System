export const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Standard creation
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
};

export const getCookie = (name) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

export const removeCookie = (name) => {
  const commonSuffix = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure";

  document.cookie = `${name}=${commonSuffix}`;

  document.cookie = `${name}=; domain=${window.location.hostname}${commonSuffix}`;

  document.cookie = `${name}=; domain=.${window.location.hostname}${commonSuffix}`;
};