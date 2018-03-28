import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { ArticlesListComponent } from './components/articles-list/articles-list.component';
import { ArticleCardComponent } from './components/articles-list/article-card/article-card.component';
import { RouterModule } from '@angular/router';
import { ArticleComponent } from './components/article/article.component';
import { FeedListComponent } from './components/feed-list/feed-list.component';
import { FeedService } from './service/feed.service';

const routes = [
    { path: 'articles', component: ArticlesListComponent },
    { path: 'articles/:id', component: ArticlesListComponent },
    { path: 'articles/:id/:articleId', component: ArticleComponent },
    { path: '', redirectTo: '/articles', pathMatch: 'full' },
];

@NgModule({
    declarations: [
        AppComponent,
        ArticlesListComponent,
        ArticleCardComponent,
        ArticleComponent,
        FeedListComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpClientJsonpModule,
        RouterModule.forRoot(routes)
    ],
    providers: [FeedService],
    bootstrap: [AppComponent]
})
export class AppModule { }
