import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoginService } from '../login/login.service';
import { HistoryComponent } from '../history/history.component';
import { wikiBit, transBit } from '../../environments/environment';

@Component({
  providers: [HistoryComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
@Injectable()
export class DashboardComponent implements OnInit {

  wikiText: any[];
  wikiBitUrl: string;
  wikiSearchString: string;
  language: string;
  title: string;

  constructor(private http: HttpClient, private loginService: LoginService, private history: HistoryComponent) {
    this.wikiText = [];
    this.wikiBitUrl = ``;
    this.wikiSearchString = '';
    this.language = 'de'; //Default language for translator is German.
    this.title = '';
  }

  //Calls the wiki search API to get an article of interest.
  //Takes the results and passes to parsing function to get the plain text and stores in array.
  searchWiki() {
    this.wikiText = []; //Clear the previous search results.
    if (this.wikiSearchString.trim() == ""){ //Exit if the string is empty.
      this.title = "Invalid Search";
      return;
    }
    this.wikiBitUrl = `${wikiBit.urlBase}${this.wikiSearchString}`;
    this.http.get(this.wikiBitUrl).subscribe( (results: any) => {
      this.title   = results.parse.title;
      var rawHTMLText: string = results.parse.text["*"];
      this.wikiText = this.divideWikiPageIntoParagraphs(rawHTMLText);
    },
    (error) => {
      console.log(error);
    });
  }

  //This function helps keep the original format of the article while transfroming the html
  //into plain text. The function slices the HTML into paragraphs by finding the <p> tags.
  //The resulting paragraphs are then stripped of all HTML elements to give a plain text
  //paragraph. The titles are extracted as well to give a resulting text page that resembles
  //the original structure of the Wikipedia article.
  divideWikiPageIntoParagraphs(wikiArticle: string){
    var results: any[] = [];
    var re1 = /<p>/gi; //We use the <p> tag to identify each paragraph and cycle through them.
    var re2 = /<\/p>/gi;
    while (wikiArticle.search(re1) != -1 && wikiArticle.search(re2) != -1){ //Keep looping while the <p> and </p> tags are found.
      var sectionTitle = this.getSectionTitle(wikiArticle); //Check for a section title first.
      //Get each paragraph and put inside a variable called slicedText.
      var slicedText = wikiArticle.slice(wikiArticle.indexOf("<p>"), wikiArticle.indexOf("</p>"));
      //Push the variable to the results array. Each string in the array is a paragraph.
      results.push({title: sectionTitle, content: this.convertHTMLToText(slicedText)});
      //Remove the previous paragraph by selecting a substring after the last </p> tag.
      wikiArticle = wikiArticle.substr(wikiArticle.indexOf("</p>") + 3);
    }
    return results;
  }

  //Takes HTML formatted text and returns the regular plain text without the HTML tags.
  convertHTMLToText(html: string){
    //txt.replace(/<\/?[^>]+>/ig, "")  This is a brute force approach to converting HTML to text that we will not use.
    html = this.removeBracketsAndNumbers(html);
    var temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  //Removes the leftover bracketed numbers found in wiki articles that are used for citations.
  removeBracketsAndNumbers(txt: string){
    var re1 = /&#91;/gi; //A bracketed number in the formatted text starts with this pattern,
    var re2 = /&#93;/gi; //and ends with this one.
    while (txt.search(re1) != -1 && txt.search(re2) != -1){ //While both are found...
      var textToRemove = txt.slice(txt.indexOf("&#91;"), txt.indexOf("&#93;") + 5); //Create a var that sandwhiches the number in the middle.
      txt = txt.replace(textToRemove, ""); //Replace it all with an empty string.
    }
    return txt; //Return the string without any wikipedia citations.
  }

  //This function gets called first in the parsing to get the title of the section in the raw HTML text.
  getSectionTitle(txt: string){
    var re1 = /"Edit section: /gi; //Each section title starts with this text.
    var re2 = /<p>/gi;             //And it must occur between a new paragraph.
    if (txt.search(re1) != -1 && (txt.search(re1) < txt.search(re2))){ //If re1 is found, and re1 comes before re2.
      var newTxt = txt.substr(txt.indexOf("\"Edit section: ") + 15); //Make re1 index 0.
      var sectionTitle = newTxt.substr(0, newTxt.indexOf("\">")); //Section title is from index 0 to where "> is found.
      return sectionTitle;
    }
    return ""; //Return empty string if the condition isn't met.
  }

  //Calls the Google Translate API and replaces HTML text with newly translated text.
  //Argument is the index number of the paragraph we want to translate.
  translateText(index: number){
    const txt = document.getElementById(`paragraph${index}`).innerHTML; //Text to translate.
    this.history.addSearchToHistory(txt);

    const httpOptions = { //Parameters to pass to API call.
      headers: null,
      params: new HttpParams()
        .append('q', txt) //Text to translate.
        .append('target', this.language) //Language we want the text translated to.
        .append('format', 'text') //Resulting format.
        .append('key', transBit.apiKey) //API key.
    };
    this.http.get(transBit.urlBase, httpOptions).subscribe( (results: any) => {
      //Set the paragraph text to the newly translated text.
      document.getElementById(`paragraph${index}`).innerHTML = results.data.translations[0].translatedText;
    }, (error) => {
      console.log(error);
    });
  }

  //This function is called by the button click and first checks if the
  //text has already been translated.
  translateButton(index: number){
    const button = document.getElementById(`button${index}`);
    if (button.innerHTML == "Translate"){ //If button says "Translate", called the translateText function.
      document.getElementById(`button${index}`).innerHTML = "Revert"; //Change Button text.
      document.getElementById(`button${index}`).className = "button active";
      this.translateText(index);
    } else { //Text is already translated. Change it back to original by finding it in the array we first created.
      document.getElementById(`button${index}`).innerHTML = "Translate"; //Change Button text.
      document.getElementById(`button${index}`).className = "button";
      document.getElementById(`paragraph${index}`).innerHTML = this.wikiText[index].content;
    }

  }
  ngOnInit() {
  }

}
