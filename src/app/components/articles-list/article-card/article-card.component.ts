import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../../../model/Article';
import { IndexDBHelper } from '../../../../indexdb';
import { CachedArticle } from '../../../model/CachedArticle';

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
        const cached = await IndexDBHelper.getValue<CachedArticle>("cachedArticle", this.article.articleId);
        this.isCached = cached != null;

        const art = await IndexDBHelper.getValue<Article>("article", this.article.articleId);
        this.article.read = art.read;
    }
    
}
