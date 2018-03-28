import { Component, OnInit } from '@angular/core';
import { Feed } from '../../model/Feed';
import { FeedService } from '../../service/feed.service';

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
    }

}
