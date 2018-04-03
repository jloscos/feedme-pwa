import { Component, OnInit } from '@angular/core';
import { MsalService } from './service/msal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private msal: MsalService){

    }
    ngOnInit(): void {
        if ('serviceWorker' in navigator) {
            (<any>navigator).serviceWorker.register('/sw.js');
        };
    }

    login() {
        this.msal.login();
    }

    logout() {
        this.msal.logout();
    }

    get authenticated() {
        return !!this.msal.user
    }
}
