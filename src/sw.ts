import { request } from "http";
import { IndexDBHelper } from "./indexdb";
import { CachedArticle } from "./app/model/CachedArticle";
import { environment } from "./environments/environment";

const cacheVersion = environment.cacheVersion;

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
                    .map(k => {
                        caches.delete(k);
                        IndexDBHelper.delete("cachedArticle", k);
                    })
            );
        })
    );
});

self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(respondToFetch(event));
});

async function respondToFetch(event: FetchEvent): Promise<Response> {
    const staticCache = await caches.open(cacheKey.static);
    let response = await staticCache.match(event.request);
    if (response) return response;

    if (event.request.url.startsWith(self.location.origin + "/articles")) {
        const cache = await caches.open(cacheKey.static);
        return await cache.match("/index.html");
    }

    const reg = /articles\/\d+\/(-?\d+)$/;
    let matches = event.request.referrer.match(reg);
    if (matches) {
        const cacheKey = "article" + cacheVersion + "_" + matches[1];
        return await cacheFirst(event, cacheKey);
    }

    if (event.request.url.match(/\/api\/Feed\/(\d+\/)?Articles/)) {
        return await networkFirst(event, cacheKey.dynamic);
    }

    matches = event.request.url.match(/\/api\/Feed\/Article\/(-?\d+)$/i);
    if (matches) {
        const cacheKey = "article" + cacheVersion + "_" + matches[1];
        await IndexDBHelper.setValue<CachedArticle>("cachedArticle", {
            articleId: +matches[1],
            cacheKey: cacheKey,
            cacheDate: new Date()
        });
        return cacheFirst(event, cacheKey);
    }

    return cacheFirst(event, cacheKey.dynamic);
}

async function cacheFirst(event: FetchEvent, cacheKey): Promise<Response> {
    const cache = await caches.open(cacheKey);
    let response = await cache.match(event.request);
    if (response) {
        event.waitUntil(fetch(event.request).then(r => cache.put(event.request, r)));
        return response;
    }
    response = await fetch(event.request);
    event.waitUntil(cache.put(event.request, response));
    return response;
}

async function networkFirst(event: FetchEvent, cacheKey): Promise<Response> {
    let response = await fetch(event.request);
    if (response && response.ok) {
        event.waitUntil(caches.open(cacheKey).then(c => c.put(event.request, response.clone())));
        return response;
    }
    const cache = await caches.open(cacheKey);
    response = await cache.match(event.request);
    return response;
}

self.addEventListener("push", (event: PushEvent) => {
    console.log(event);
    const payload: any = event.data.json();
    event.waitUntil(
        self.registration.showNotification("FeedMe", <any>{
            body: payload.Title,
            dir: "ltr",
            tag: "feedme",
            icon: "/assets/icon-50x50.png",
            badge: "/assets/icon-50x50.png",
            image: `/api/Feed/Article/${payload.articleId}/Image`,
            data: payload,
            actions: [
                { action: "read", title: "Read now", icon: "/assets/icon/eye-4x.png" },
                { action: "later", title: "Read later", icon: "/assets/icon/timer-4x.png" }
            ]
        })
    );
});

self.addEventListener("notificationclick", (event: any) => {
    const url = event.target.location.origin;
    const feedId = event.notification.data.feedId;
    const articleId = event.notification.data.articleId;
    event.notification.close();
    if (event.action == "later") {
        event.waitUntil(readLater(articleId));
    } else {
        event.waitUntil(self.clients.openWindow(`${url}/articles/${feedId}/${articleId}`));
    }
});

async function readLater(articleId) {
    const request = `/api/Article/${articleId}`;
    const response = await fetch(request);
    const article = await response.json();
    const cache = await caches.open("article" + cacheVersion + "_" + articleId);
    await cache.put(request, response);
    const content: string = article.content;
    const regex = /src="([^\"]+)"/g;
    let match: RegExpExecArray;
    while ((match = regex.exec(content)) != null) {
        await cache.add(match[1]);
    }
    await IndexDBHelper.setValue<CachedArticle>("cachedArticle", {
        articleId: articleId,
        cacheKey: "article" + cacheVersion + "_" + articleId[1],
        cacheDate: new Date()
    });
}

self.addEventListener("message", async (event: MessageEvent) => {
    if (event.data.action == "read-later") {
        const articleId = event.data.articleId;
        readLater(articleId);
    }
});

self.addEventListener("sync", (event: SyncEvent) => {
    if (event.tag.startsWith("read-")) {
        const articleId = parseInt(event.tag.substr(5));
        event.waitUntil(
            fetch(`/api/Feed/Article/${articleId}/Read`, {
                method: "POST",
                body: ""
            })
        );
    }
});

self.addEventListener("periodicsync", event => {
    if (event.registration.tag == "get-latest") {
        event.waitUntil(getLatestArticles());
    } else {
        event.registration.unregister();
    }
});

async function getLatestArticles() {
    const request = new Request("/api/Feed/Articles");
    const response = await fetch(request);
    const cache = await caches.open(cacheKey.dynamic);
    await cache.put(request, response);
    const articles = await response.json();
    await IndexDBHelper.setValues("article", articles);
}
