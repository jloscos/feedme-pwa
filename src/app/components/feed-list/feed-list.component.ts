import { Component, OnInit } from '@angular/core';
import { Feed } from '../../model/Feed';
import { FeedService } from '../../service/feed.service';
import { IndexDBHelper } from '../../../indexdb';
import { Article } from '../../model/Article';
import { Router, NavigationEnd } from '@angular/router';
import "rxjs/add/operator/filter";
@Component({
    selector: 'app-feed-list',
    templateUrl: './feed-list.component.html',
    styleUrls: ['./feed-list.component.css']
})
export class FeedListComponent implements OnInit {

    feeds: Feed[];
    showMenu = false;
    nbNotReadAll = 0;

    constructor(private _feed: FeedService, private _router: Router) { }

    async ngOnInit() {
        this._router.events.filter(e => e instanceof NavigationEnd).subscribe(e => this.refreshFeeds());
        this.feeds = await this._feed.getFeeds();
        await this.refreshFeeds();
    }

    async refreshFeeds() {
        let nbNotRead = 0;
        if (this.feeds) {
            for (let f of this.feeds) {
                let articles = await IndexDBHelper.getByIndex<Article>("article", "FeedIndex", f.feedId);
                f.nbNotRead = articles.filter(a => !a.read).length;
                nbNotRead += f.nbNotRead;
            }
        }
        this.nbNotReadAll = nbNotRead;
    }

}
