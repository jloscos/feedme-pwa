import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../service/feed.service';
import { Article } from '../../model/Article';
import { ActivatedRoute } from '@angular/router';
import { Feed } from '../../model/Feed';
import { IndexDBHelper } from '../../../indexdb';
import { SubscriptionService } from '../../service/subscription.service';

@Component({
    selector: 'app-articles-list',
    templateUrl: './articles-list.component.html',
    styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {

    articleList: Article[];
    subscribing: boolean = false;

    private feedId: number;
    feed: Feed;
    currentPage = 0;
    
    constructor(private _feed: FeedService, private _subscription: SubscriptionService, private route: ActivatedRoute) { }

     ngOnInit() {
        this.route.paramMap.subscribe(param => {
           this.feedId = +param.get('id');
           if (this.feedId)
                IndexDBHelper.getValue<Feed>("feed", this.feedId).then(f => this.feed = f);
           this.load();
        });
    }

    async load(){
        if (this.feedId)
            this.articleList = await this._feed.getArticlesForFeed(this.feedId, this.currentPage);
        else
            this.articleList = await this._feed.getArticles(this.currentPage);

        const art = await IndexDBHelper.searchValues<Article>("article", "");
        this.articleList.forEach(a => {
            const d = art.find(d => d.articleId == a.articleId);
            a.read = (d && d.read) || a.read;
        });
        await IndexDBHelper.setValues("article", this.articleList.map(a => ({articleId: a.articleId, feedId: a.feedId, read: a.read})));
    }

    get canSubscribe() {
        return this._subscription.hasPermission && !this.subscribing;
    }
    async toggleSubscribe() {
        this.subscribing = true;
        if (this.feed.subscribed)
            await this._subscription.unSubscribeFromFeed(this.feedId);
        else
            await this._subscription.subscribeToFeed(this.feedId);
        this.feed = await IndexDBHelper.getValue<Feed>("feed", this.feedId);
        this.subscribing = false;
    
    }
}
