import { Injectable, InjectionToken, Inject } from "@angular/core";
import * as Msal from "msal";
import { environment } from "../../environments/environment";

export interface MsalConfig {
    clientID: string;
    graphScopes: string[];
    signUpSignInPolicy?: string;
    tenant?: string;
}

@Injectable()
export class MsalService {
    public error: string;
    private _user: any;
    private app: Msal.UserAgentApplication;


    constructor() {
        this.app = new Msal.UserAgentApplication(environment.msalConfig.clientID, null, this.authCallback, {
            redirectUri: window.location.origin
        });
        // this.app = new Msal.UserAgentApplication(environment.msalConfig.clientID, null, () => {});
    }

    get user() {
        if (!this._user)
            this._user = this.app.getUser();
        return this._user;
    }

    public login() {
        return this.app.loginPopup(environment.msalConfig.graphScopes).then(idToken => {
            return this.getToken().then(() => {
                Promise.resolve(this.app.getUser());
            });
        });
    }

    public getToken() {
        return this.app
        .acquireTokenSilent(environment.msalConfig.graphScopes)
        .then(token => {
            return token;
        })
        .catch(error => {
            console.log(error);
        });
    }

    public logout() {
        this._user = null;
        this.app.logout();
    }

    private authCallback(errorDesc: any, token: any, error: any, tokenType: any) {
        console.log("token : " + token);
        if (error) {
            console.error(`${error} ${errorDesc}`);
        }
    }
}
