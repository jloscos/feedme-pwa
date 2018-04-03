import { Component, OnInit } from "@angular/core";
import { MsalService } from "./service/msal.service";

interface ServiceWorkerNavigator extends Navigator {
    serviceWorker: ServiceWorkerContainer;
}

declare var navigator: ServiceWorkerNavigator;

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    // constructor(private msal: MsalService) {}
    ngOnInit(): void {
        if ("serviceWorker" in navigator) {
            (<any>navigator).serviceWorker.register("/sw.js");
            navigator.serviceWorker.ready.then((sw: any) => {
                if (sw.periodicSync) {
                    sw.periodicSync.register({
                        tag: "get-latest",
                        minPeriod: 1 * 60 * 60 * 1000,  // toute les heures
                        powerState: "avoid-draining",   // 'auto'
                        networkState: "online"          // avoid-cellular
                    });
                }
            });
        }
        window.addEventListener("beforeinstallprompt", e => {
            e.preventDefault();
            window["installPrompt"] = e;
            return false;
        });
    }

    /*
    login() {
        this.msal.login();
    }

    logout() {
        this.msal.logout();
    }

    get authenticated() {
        return !!this.msal.user;
    }
    */
}
