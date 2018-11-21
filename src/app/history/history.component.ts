import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { LoginService } from '../login/login.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})

export class HistoryComponent implements OnInit {

  searches: any[];
  searchRef: any;
  isHistoryRetrieved: boolean;

  constructor(private database: AngularFireDatabase, private loginService: LoginService) {
    this.searches = [];
    this.searchRef = this.database.list('searches');
    this.isHistoryRetrieved = false;
  }

  getHistory(){
    this.searchRef.valueChanges().subscribe((results: any) => {
      if (this.isHistoryRetrieved)
        return; //If history displayed once already, don't continuously update.
      results.forEach(result => {
        this.searches.push({searchText: result.searchText, createdAt: result.createdAt, user: result.user,});
      });
      this.searches.reverse();
      console.log(this.searches);
      this.isHistoryRetrieved = true;
    }, (error) => {
      console.log(error);
    });
  }

  addSearchToHistory(searchText: string){
    const date: Date = new Date();
    const createdAt = firebase.database.ServerValue.TIMESTAMP;
    const user = this.loginService.userUid;
    this.searchRef.set(date.toString(), {createdAt: createdAt, searchText: searchText, user: user});
  }

  ngOnInit() {
    this.getHistory();
  }
}
