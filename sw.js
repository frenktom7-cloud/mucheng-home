const CACHE_NAME = "idol-shell-v1";

// 根据项目结构调整缓存资源
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const AUDIO_ASSETS = [
  "/audio/track-01.mp3",
  "/audio/track-02.mp3",
  "/audio/track-03.mp3"
];

const IMAGE_ASSETS = [
  "/assets/sticker-heart.png",
  "/assets/sticker-star.png",
  "/assets/sticker-moon.png"
];

const ASSETS_TO_CACHE = [...CORE_ASSETS, ...AUDIO_ASSETS, ...IMAGE_ASSETS];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => {
            return caches.delete(oldKey);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 仅处理 GET 请求
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 只缓存同源请求
  if (url.origin !== self.location.origin) {
    return;
  }

  // 对静态资源采用 cache-first 策略
  if (
    ASSETS_TO_CACHE.some((asset) => url.pathname.startsWith(asset.replace(/\/[^/]*$/, "")))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        });
      })
    );
    return;
  }

  // 其他请求采用网络优先，失败时回退到缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

