import { Component, OnInit } from '@angular/core';
import { Feed } from '../../model/Feed';
import { FeedService } from '../../service/feed.service';
import { IndexDBHelper } from '../../../indexdb';
import { Article } from '../../model/Article';

@Component({
    selector: 'app-feed-list',
    templateUrl: './feed-list.component.html',
    styleUrls: ['./feed-list.component.css']
})
export class FeedListComponent implements OnInit {

    feeds: Feed[];
    constructor(private _feed: FeedService) { }

    async ngOnInit() {
        this.feeds = await this._feed.getFeeds();
        for(let f of this.feeds) {
            let articles = await IndexDBHelper.getByIndex<Article>("article", "FeedIndex", f.feedId);
            f.nbNotRead = articles.filter(a => !a.read).length;
        }
    }

}
