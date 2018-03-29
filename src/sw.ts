import { request } from "http";
import { IndexDBHelper } from "./indexdb";
import { CachedArticle } from "./app/model/CachedArticle";

const cacheVersion = "1";

const cacheKey = {
    static: "static" + cacheVersion,
    dynamic: "dynamic" + cacheVersion
};

declare var self: ServiceWorkerGlobalScope;

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheKey.static).then(cache => {
            cache.addAll([
                "/",
                "/favicon.ico",
                "/index.html",
                "/inline.bundle.js",
                "/main.bundle.js",
                "/polyfills.bundle.js",
                "/scripts.bundle.js",
                "/styles.bundle.js",
                "/vendor.bundle.js"
            ]);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(async keys => {
            const articles = await IndexDBHelper.searchValues<CachedArticle>("cachedArticle", 0);
            const cacheExpiration = new Date();
            cacheExpiration.setDate(cacheExpiration.getDate() + 30);
            return Promise.all(
                keys
                    .filter(k => {
                        if (Object.keys(cacheKey).includes(k)) return false;
                        const article = articles.find(a => a.cacheKey == k);
                        if (article && article.cacheDate < cacheExpiration) return false;
                        return true;
                    })
                    .map(k => caches.delete(k))
            );
        })
    );
});

self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(respondToFetch(event));
});

async function respondToFetch(event: FetchEvent) {
    const staticCache = await caches.open(cacheKey.static);
    let response = await staticCache.match(event.request);
    if (response) return response;

    if (event.request.url.startsWith(self.location.origin + "/articles")) {
        const cache = await caches.open(cacheKey.static);
        return await cache.match("/index.html");
    }
    const reg = /articles\/\d+\/(-?\d+)$/;
    let m = event.request.referrer.match(reg);
    if (m) {
        const articleId = m[1];
        const cache = await caches.open("article" + cacheVersion + "_" + articleId);
        response = await cache.match(event.request);
        if (!response) {
            response = await fetch(event.request);
            cache.put(event.request, response.clone());
        }
        return response;
    }

    const cache = await caches.open(cacheKey.dynamic);
    response = await cache.match(event.request);
    if (response) return response;

    response = await fetch(event.request);
    cache.put(event.request, response.clone());
    m = event.request.url.match(/\/api\/Feed\/Article\/(-?\d+)$/i);
    if (m) {
        await IndexDBHelper.setValue<CachedArticle>("cachedArticle", {
            articleId: +m[1],
            cacheKey: "article" + cacheVersion + "_" + m[1],
            cacheDate: new Date()
        });
    }
    return response;
}

self.addEventListener("push", (event: PushEvent) => {
    console.log(event.data);
    event.waitUntil(
        self.registration.showNotification("FeedMe", {
            body: "Push Notification Subscription Management",
            dir: "ltr",
            tag: "feedme",
            icon: ""
        })
    );
});
