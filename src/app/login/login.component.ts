import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  providers: [AppComponent],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  
  constructor(
    private loginService: LoginService,
    private router: Router,
    private comp: AppComponent
  ) { }

  ngOnInit() {
  }

  onLoginEmail(): void {
    if (this.email == null || this.password == null){
      this.showInvalidMessage(true);
    }
    else if (this.validateForm(this.email, this.password)) {
      this.emailLogin(this.email, this.password);
    } else {
      this.showInvalidMessage(true);
    }
  }

  validateForm(email: string, password: string): boolean {
    if (email.length === 0) {
      return false;
    }

    if (password.length === 0) {
      return false;
    }

    if (password.length < 6) {
      return false;
    }
    return true;
  }

  emailLogin(email: string, password: string) {
    this.loginService.loginWithEmail(this.email, this.password)
        .then(() => {
          this.comp.showToolBar(true);
          this.comp.showUserType(true);
          this.showInvalidMessage(false);
          this.router.navigate(['/dashboard'])
        })
        .catch( error => {
          console.log(error);
          this.router.navigate(['/login']);
          this.showInvalidMessage(true);
        });
  }

  showInvalidMessage(isOn: boolean){
    if (isOn){
      document.getElementById("error").style.display="inline";
    } else {
      document.getElementById("error").style.display="none";
    }
  }
}
