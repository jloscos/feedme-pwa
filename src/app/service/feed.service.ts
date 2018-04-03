import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Article } from "../model/Article";

import * as moment from 'moment'
import "rxjs/add/operator/map";
import { Feed } from "../model/Feed";
import { IndexDBHelper } from "../../indexdb";

interface ServiceWorkerNavigator extends Navigator {
    serviceWorker: ServiceWorkerContainer
}

declare var navigator: ServiceWorkerNavigator

@Injectable()
export class FeedService {

    constructor(private http: HttpClient) {

    }

    private feedFromApi(data: any): Feed {
        const feed: Feed = Object.assign(new Feed(), data);
        feed.imageUrl = `/api/Feed/${feed.feedId}/Image`;
        return feed;
    }

    getFeeds() {
        return this.http.get("/api/Feed")
            .map((r: any[]) => r.map(f => this.feedFromApi(f)))
            .map(feeds => {
                feeds.map(f => IndexDBHelper.setValue("feed", f));
                return feeds;
            })
            .toPromise();
    }
    getArticles(page: number) {
        return this.http.get(`/api/Feed/Articles?page=${page}`)
            .map((r: any[]) => r.map(a => Article.fromApi(a)))
            .toPromise();
    }


    getArticlesForFeed(feedId: number, page: number) {
        return this.http.get(`/api/Feed/${feedId}/Articles?page=${page}`)
            .map((r: any[]) => r.map(a => Article.fromApi(a)))
            .toPromise();
    }

    getArticleById(articleId: number) {
        return this.http.get(`/api/Feed/Article/${articleId}`)
            .map(r => Article.fromApi(r))
            .toPromise();
    }


    async markAsRead(articleId) {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const sw = await navigator.serviceWorker.ready;
                await sw.sync.register(`read-${articleId}`);
            }
            catch {
                await this.http.post(`/api/Feed/Article/${articleId}/Read`, {}).toPromise();
            }
        } else {
            await this.http.post(`/api/Feed/Article/${articleId}/Read`, {}).toPromise();
        }
        const article = await IndexDBHelper.getValue<Article>("article", articleId);
        article.read = true;
        await IndexDBHelper.setValue("article", article);
    }
}
