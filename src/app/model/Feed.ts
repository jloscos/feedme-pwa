import * as moment from 'moment';

export class Feed {
    feedId: number;
    title: string;
    description: string;
    imageUrl: string;
    lastUpdate: moment.Moment;
    subscribed: boolean;
}
