import { Component } from '@angular/core';
import { LoginService } from './login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'translate-app'

  constructor(private loginService: LoginService) {}

  showToolBar(isOn: boolean){
    if (isOn){
      document.getElementById("headerChild").style.display = "inline";
    } else {
      document.getElementById("headerChild").style.display = "none";
    }
  }

  showUserType(isOn: boolean){
    if (isOn){
      var type: string;
      if (this.loginService.isAdmin()){
        type = "Admin";
      } else {
        type = "User";
      }
      document.getElementById("userType").innerHTML = "";
      document.getElementById("userType").style.display = "inline";
    } else {
      document.getElementById("userType").innerHTML = "";
      document.getElementById("userType").style.display = "none";
    }
  }

  logout() {
    this.loginService.signOut();
    this.showToolBar(false);
    this.showUserType(false);
  }
}
