import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../../../model/Article';
import { IndexDBHelper } from '../../../../indexdb';
import { CachedArticle } from '../../../model/CachedArticle';

interface ServiceWorkerNavigator extends Navigator {
    serviceWorker: ServiceWorkerContainer;
}

declare var navigator: ServiceWorkerNavigator;

@Component({
    selector: 'app-article-card',
    templateUrl: './article-card.component.html',
    styleUrls: ['./article-card.component.css']
})
export class ArticleCardComponent implements OnInit {

    @Input()
    article: Article;

    isCached: boolean;

    get canRead() {
        return navigator.onLine || this.isCached;
    }
    constructor() { }

    async ngOnInit() {
        const cached = await IndexDBHelper.getByIndex<CachedArticle>("cachedArticle", "ArticleIndex", this.article.articleId);
        this.isCached = cached[0] != null;

        const art = await IndexDBHelper.getValue<Article>("article", this.article.articleId);
        if (art)
            this.article.read = art.read;
    }

    readLater() {
        navigator.serviceWorker.controller.postMessage({action:"read-later", articleId: this.article.articleId});
        this.isCached = true;
    }
}
