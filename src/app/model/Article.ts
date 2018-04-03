import * as moment from 'moment';

export class Article {
    articleId: number;
    feedId: number;
    title: string;
    link: string;
    publishDate: moment.Moment;
    creator: string;
    description: string;
    content: string;
    image: string;
    read: boolean = false;

    static toApi(article: Article) {
        const data:any = Object.assign({}, article);
        data.publishDate = article.publishDate.toDate();
        return data;
    }

    static fromApi(data: any): Article {
        const article: Article = Object.assign(new Article(), data);
        article.publishDate = moment(data.PublishDate);
        if (data.image)
            article.image = `/api/Feed/Article/${article.articleId}/Image`;
        else
            article.image = `/api/Feed/${article.feedId}/Image`;
        return article;
    }
}
