import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { LoginService } from '../login/login.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

@Injectable()
export class HisGuard implements CanActivate {

  constructor(private authService: LoginService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      return this.authService.admin.pipe(
        take(1),
        map((user) => !!user),
        tap((isAdmin) => {
          if (!isAdmin) {
            console.log('access denied');
            window.alert("History only available to admin.");
          }
        })
      );
    }
}
