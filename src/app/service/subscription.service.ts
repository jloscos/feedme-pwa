import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IndexDBHelper } from "../../indexdb";
import { Feed } from "../model/Feed";


interface ServiceWorkerNavigator extends Navigator {
    serviceWorker: ServiceWorkerContainer
}

declare var navigator : ServiceWorkerNavigator

@Injectable()
export class SubscriptionService {

    private publicKey:string = "";

    constructor(private http: HttpClient) {

    }

    hasPermission() {
        return "Notification" in window && (<any>Notification).permission !== 'denied';
    }

    async subscribeToFeed(feedId: number) {
        const sw = await navigator.serviceWorker.ready;
        const subscription = sw.pushManager.getSubscription();
        if (!subscription)
            await this.subscribe();
        await this.http.post("/api/Subscriptions/Feed", {feedId: feedId, subscribe: true}).toPromise();
        const feed = await IndexDBHelper.getValue<Feed>("feed", feedId);
        feed.subscribed = true;
        await IndexDBHelper.setValue<Feed>("feed", feed);
    }

    async unSubscribeFromFeed(feedId: number) {
        const feeds = await IndexDBHelper.searchValues<Feed>("feed", "");
        if (feeds.filter(f => f.subscribed && f.feedId != feedId).length == 0)
            await this.unsubscribe();
        const feed = feeds.find(f => f.feedId == feedId);
        feed.subscribed = false;
        await IndexDBHelper.setValue<Feed>("feed", feed);
    }

    async subscribe() {
        if ((<any>Notification).permission !== "granted")
            if (await Notification.requestPermission() === "denied")
                return false;
        const sw = await navigator.serviceWorker.ready;
        const subscription = await sw.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(this.publicKey)});
        await this.http.post("/api/Subscriptions/Subscribe", subscription.toJSON()).toPromise();
    }

    async unsubscribe() {
        const sw = await navigator.serviceWorker.ready;
        const subscription = await sw.pushManager.getSubscription()
        await subscription.unsubscribe();
        await this.http.post("/api/Subscriptions/Unsubscribe", subscription.toJSON()).toPromise();

    }

}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    ;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }
