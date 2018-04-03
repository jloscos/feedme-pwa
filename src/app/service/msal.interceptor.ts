import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MsalService } from './msal.service';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap'
@Injectable()
export class MsalInterceptor implements HttpInterceptor {

    constructor(private msalService: MsalService) { }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return Observable.fromPromise(this.msalService.getToken().then(token => {
            if (token) 
                req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
            return req;
        })).mergeMap(req => next.handle(req));
    }
}