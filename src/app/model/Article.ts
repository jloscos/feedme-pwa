import * as moment from 'moment';

export class Article {
    articleId: number;
    feedId: number;
    title: string;
    link: string;
    publishDate: moment.Moment;
    creator: string;
    content: string;
    image: string;
    read: boolean = false;
}
