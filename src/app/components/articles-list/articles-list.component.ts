import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../service/feed.service';
import { Article } from '../../model/Article';
import { ActivatedRoute } from '@angular/router';
import { Feed } from '../../model/Feed';
import { IndexDBHelper } from '../../../indexdb';

@Component({
    selector: 'app-articles-list',
    templateUrl: './articles-list.component.html',
    styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {

    articleList: Article[];

    private feedId: number;
    feed: Feed;
    currentPage = 0;
    
    constructor(private _feed: FeedService, private route: ActivatedRoute) { }

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
        
    }

}
