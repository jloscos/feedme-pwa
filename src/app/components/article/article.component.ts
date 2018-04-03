import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../service/feed.service';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../../model/Article';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

    article: Article;
    articleId: string;
    content: any;
    gists: any[];

    constructor(private _feed: FeedService, private http: HttpClient, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.route.paramMap.subscribe(param => {
            this.articleId = param.get('articleId');
            this.load();
        });
        const promptEvent = window["installPrompt"];
        if (promptEvent) {
            promptEvent.prompt();
            promptEvent.userChoice.then(function(choiceResult) {
                console.log(choiceResult.outcome);
                if(choiceResult.outcome == 'dismissed') {
                    console.log('User cancelled home screen install');
                }
                else {
                    console.log('User added to home screen');
                }
                window["installPrompt"] = null;
            });
        }
    }

    async load() {
        this.gists = [];
        this.article = await this._feed.getArticleById(this.articleId);
        this._feed.markAsRead(this.articleId);
        this.replaceGists();
        setTimeout(() => this.addEmbeddedGists());
    }


    replaceGists() {
        const reg = /\<script[^\>]+src="(https:\/\/gist.github.com\/([^\/]+)\/([^\.]+)\.js)"[^\>]*\>[^\<]*\<\/script\>/g;
        this.content = this.article.content.replace(reg, (c, url, user, id) => {
            this.gists.push({id: id, user:user, url: url});
            return `<span id="${user}-${id}"></span>`;
        });
        this.content = this.sanitizer.bypassSecurityTrustHtml(this.content);
    }


    async addEmbeddedGists(){
        for(const g of this.gists) {
            const gist:any = await this.getGist(g.user, g.id);
            const span = document.getElementById(`${g.user}-${g.id}`);
            if (this.gists.indexOf(g) == 0) {
                const link = document.createElement("link");
                link.href = gist.stylesheet;
                link.rel="stylesheet";
                span.parentNode.appendChild(link);
            }
            span.innerHTML = gist.div;
        }
    }

    getGist(user, id) {
        return this.http.jsonp(`https://gist.github.com/${user}/${id}.json`, "callback").toPromise();
    }
}
