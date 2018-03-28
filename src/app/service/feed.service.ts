import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Article } from "../model/Article";

import * as moment from 'moment'
import "rxjs/add/operator/map";
import { Feed } from "../model/Feed";

@Injectable()
export class FeedService {

    constructor(private http: HttpClient) {

    }

    private articleFromApi(data: any) : Article {
        const article:Article = Object.assign(new Article(), data);
        article.publishDate = moment(data.PublishDate);
        return article;
    }

    private feedFromApi(data: any) : Feed {
        const feed: Feed = Object.assign(new Feed(), data);
        return feed;
    }

    getFeeds() {
        return this.http.get("/api/Feed")
            .map((r:any[]) => r.map(f => this.feedFromApi(f)))
            .toPromise();
    }

    getArticles(page: number) {
        return this.http.get(`/api/Feed/Articles?page=${page}`)
            .map((r:any[]) => r.map(a => this.articleFromApi(a)))
            .toPromise();
    }

    
    getArticlesForFeed(feedId: number, page: number) {
        return this.http.get(`/api/Feed/${feedId}/Articles?page=${page}`)
            .map((r:any[]) => r.map(a => this.articleFromApi(a)))
            .toPromise();
    }

    getArticleById(articleId: string) {
        return this.http.get(`/api/Feed/Article/${articleId}`)
        .map(r => this.articleFromApi(r))
        .toPromise();
    }

}
