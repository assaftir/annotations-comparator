import { Component, OnInit } from '@angular/core';
import { ManuscriptService } from '../services/services.imageService';
import { error } from 'util';
import { Manuscript } from '../models/manuscript';
import { ImagePage, TextboxNote, ImageLayers, Pixel } from '../models/image-page';
import { version } from 'punycode';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as myGlobals from '../../../src/globals';

const xDelta = 30;
const yDelta = 30;


@Component({
  selector: 'app-sidenav-open-close',
  templateUrl: './sidenav-open-close.component.html',
  styleUrls: ['./sidenav-open-close.component.scss']
})



export class SidenavOpenCloseComponent implements OnInit {
  opened: boolean;
  public myfile;
  public profileManuscripts: Manuscript[];
  public originalManuscripts : Manuscript[];
  userName = 'HodAmran';
  errorMessage: string;
  _currentWorkingManuscript: number;
  jsonDiff : string;
  public diffsJson: Manuscript[];
  //comapreDiff
  public chapterNum : number;
  public v1 : number;
  public v2 : number;
  public pageNum : number;

  constructor(private _manuscriptService: ManuscriptService) {
    this.opened = true;
    // this._currentWorkingManuscript = 0 ;
   }

   //#region  toggle navigation
  public selectedVal: number;
  public onValChange(val: number) {
    console.log('change to manuscript ' + val );
    this._currentWorkingManuscript = val ;
    
  }
  
  
  public isSameAnnotation(firstTextBox : TextboxNote, secondTextBox : TextboxNote) {
    let firstStartPoint = firstTextBox.startPoint;
    let secondStartPoint = secondTextBox.startPoint;
    return (Math.abs(firstStartPoint.x - secondStartPoint.x) < xDelta &&
            Math.abs(firstStartPoint.y - secondStartPoint.y) < yDelta)
  }  

  public initJson(originalJson : Manuscript[]){
    this.diffsJson = new Array<Manuscript>(originalJson.length);
    for(let i = 0 ; i < this.diffsJson.length ; i++){
      this.diffsJson[i] = new Manuscript();
      this.diffsJson[i].title = originalJson[i].title;
      this.diffsJson[i].id = originalJson[i].id;
      this.diffsJson[i].pages = new Array<ImagePage>(originalJson[i].pages.length);
      for(let j = 0 ; j < this.diffsJson[i].pages.length ; j++){
        this.diffsJson[i].pages[j] = new ImagePage();
        this.diffsJson[i].pages[j].pageNumber = originalJson[i].pages[j].pageNumber;
        this.diffsJson[i].pages[j].imageUrl = originalJson[i].pages[j].imageUrl;
        delete this.diffsJson[i].pages[j].isChanges;
        if(!originalJson[i].pages[j])
          continue;
        this.diffsJson[i].pages[j].version = new Array<ImageLayers>(1);
        for(let k = 0 ; k < 1 ; k++){
          this.diffsJson[i].pages[j].version[k] = new ImageLayers();
          if(!originalJson[i].pages[j].version[k].annotationLayer)
            continue;
          this.diffsJson[i].pages[j].version[k].annotationLayer = new Array<TextboxNote>(originalJson[i].pages[j].version[k].annotationLayer.length)
        }
      }
    }
  }

  public comapreAll(originalJson : Manuscript[]){
    this.initJson(originalJson);
    let unifiedNote = '';
    //Combine matching annotation to a single textbox, separated by '-----'
    for (let chap = 0; chap < originalJson.length; chap++) {
      let chapterPages : ImagePage[] = originalJson[chap].pages;
      for(let page = 0 ; page < chapterPages.length ; page++){
        let pageVersions : ImageLayers[] = chapterPages[page].version;
        for(let v1 = 0 ; v1 < pageVersions.length ; v1++){
          if(pageVersions[v1] == undefined)
            continue;
          let versionTextNotes : TextboxNote[] = pageVersions[v1].annotationLayer;
          if(versionTextNotes == undefined)
            continue;
          for(let t1 = 0 ; t1 < versionTextNotes.length ; t1++){ //caught first textbox
            unifiedNote = versionTextNotes[t1].textNote + ' ----- ';
            for(let v2 = v1 + 1 ; v2 < pageVersions.length ; v2++){ //next verions loop
              if(pageVersions[v2] == undefined)
                continue;
              let secondVersionTextNotes : TextboxNote[] = pageVersions[v2].annotationLayer;
              for(let t2 = 0 ; t2 < secondVersionTextNotes.length ; t2++){ //next version textNotes loop
                if (this.isSameAnnotation(versionTextNotes[t1], secondVersionTextNotes[t2])){
                  unifiedNote += secondVersionTextNotes[t2].textNote + ' ----- ';
                }
              }
            }
            if(!this.diffsJson[chap].pages[page].version[0].annotationLayer){
              this.diffsJson[chap].pages[page].version[0].annotationLayer = new Array<TextboxNote>(1000);
            }
            if(!this.alreadyContains(this.diffsJson[chap].pages[page].version[0].annotationLayer, versionTextNotes[t1].startPoint, versionTextNotes[t1].height, versionTextNotes[t1].width)){
              this.diffsJson[chap].pages[page].version[0].annotationLayer.push(
                new TextboxNote(versionTextNotes[t1].startPoint,
                                versionTextNotes[t1].height,
                                versionTextNotes[t1].width,
                                unifiedNote));
            }
          }
        }
      }
    }
    //Counts and marks the matching annotations of a given textbox.
    for (let chap = 0; chap < this.diffsJson.length; chap++) {
      let chapterPages : ImagePage[] = this.diffsJson[chap].pages;
      for(let page = 0 ; page < chapterPages.length ; page++){
        let pageVersions : ImageLayers[] = chapterPages[page].version;
        for(let v1 = 0 ; v1 < pageVersions.length ; v1++){
          if(pageVersions[v1] == undefined)
            continue;
          let versionTextNotes : TextboxNote[] = pageVersions[v1].annotationLayer;
          if(versionTextNotes == undefined)
            continue;
          for(let t1 = 0 ; t1 < versionTextNotes.length ; t1++){ //caught first textbox
            var splitted = versionTextNotes[t1].textNote.split("-----");
            var annotationsList = [];
            for(let i = 0 ; i < splitted.length ; i++){
              if(splitted[i].trim() != ""){
                annotationsList.push(splitted[i].trim());
              }
            }
            for(let i = 0 ; i < annotationsList.length ; i++){
              annotationsList[i] = annotationsList[i].trim();
            }
            var annotationsMap = {};
            for(let i = 0 ; i < annotationsList.length ; i++){
              var v = annotationsMap[annotationsList[i]];
              if(v != undefined){
                annotationsMap[annotationsList[i]] = v + 1;
              } else {
                annotationsMap[annotationsList[i]] = 1;
              }
            }
            var s : string = "";
            for(var key in annotationsMap){
              var curr : string = "";
              curr = "[" + String(annotationsMap[key]) + "] Annotator(s) - ";
              curr += String(key);
              s += (curr + ' ----- ');
            }
            versionTextNotes[t1].textNote = s;
          }
        }
      }
    }
    this.profileManuscripts = this.diffsJson;
  }

alreadyContains(textBoxes : TextboxNote[], sp : Pixel, height : number, width : number){
  for(let i = 0 ; i < textBoxes.length ; i++){
    if(textBoxes[i].startPoint.x == sp.x &&
       textBoxes[i].startPoint.y == sp.y &&
       textBoxes[i].height == height &&
       textBoxes[i].width == width){
         return true;
       }
  }
  return false;
}

compareDiff(originalJson : Manuscript[]) {
    this.initJson(originalJson);
    let page : ImagePage = originalJson[this.chapterNum].pages[this.pageNum];
    let firstVersion = this.v1;
    let secondVersion = this.v2;
    let unifiedNote = '';
    let foundMatch : boolean = false;
    let firstVersionPageAnnotations : TextboxNote[] = page.version[firstVersion].annotationLayer;
    let secondVersionPageAnnotations : TextboxNote[] = page.version[secondVersion].annotationLayer;
    if(firstVersionPageAnnotations == undefined || secondVersionPageAnnotations == undefined){
        return null;
    }
    for (let i = 0 ; i < firstVersionPageAnnotations.length ; i++) {
      foundMatch = false;
        for(let j = 0 ; j < secondVersionPageAnnotations.length ; j++){
            if(!this.isSameAnnotation(firstVersionPageAnnotations[i], secondVersionPageAnnotations[j])){
                continue;
            }
            foundMatch = true;
            /* We have a possible match, proccess it by diff and add it to the diffs array */         
            unifiedNote = firstVersionPageAnnotations[i].textNote + '-----' + secondVersionPageAnnotations[j].textNote;
            if(!this.diffsJson[this.chapterNum].pages[this.pageNum].version[0].annotationLayer){
              this.diffsJson[this.chapterNum].pages[this.pageNum].version[0].annotationLayer = new Array<TextboxNote>(1000);
            }
            this.diffsJson[this.chapterNum].pages[this.pageNum].version[0].annotationLayer.push(
                                                                                              new TextboxNote(firstVersionPageAnnotations[i].startPoint,
                                                                                                              firstVersionPageAnnotations[i].height,
                                                                                                              firstVersionPageAnnotations[i].width,
                                                                                                              unifiedNote));
        }
        if(!foundMatch){
          this.diffsJson[this.chapterNum].pages[this.pageNum].version[0].annotationLayer.push(
            new TextboxNote(firstVersionPageAnnotations[i].startPoint,
                            firstVersionPageAnnotations[i].height,
                            firstVersionPageAnnotations[i].width,
                            firstVersionPageAnnotations[i].textNote));
        }
    }
    this.profileManuscripts = this.diffsJson;
}
  //#region

  ngOnInit(): void {
    this._manuscriptService.getManuscriptOfUser('./api/manuscripts2.json')
      .subscribe(profileManuscripts => {
        this.profileManuscripts = profileManuscripts;
      },
        error => this.errorMessage = <any>error);
  }

  onFileChanged(event) {
    this.myfile = event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(this.myfile);
    reader.onload = () => {
      console.log('file loaded');
      this.profileManuscripts = JSON.parse(reader.result).mydata;
      this.originalManuscripts = this.profileManuscripts;
    };
  }

  fetchFromDB() {
    this._manuscriptService.fetchFromDB('http://localhost:27080/Annotations/Manuscripts/_find')
    .subscribe(data => {
      this.profileManuscripts = (data.results[0]).mydata;
      this.originalManuscripts = this.profileManuscripts;
    },
      error => this.errorMessage = <any>error);
  }

  comapreAnnotations() {
    this.resetView();
    myGlobals.setDiffMode(false);
    myGlobals.setCompareMode(true);
    this.comapreAll(this.profileManuscripts);
  }

  comapreVersions() {
    this.resetView();
    myGlobals.setCompareMode(false);
    myGlobals.setDiffMode(true);
    this.compareDiff(this.profileManuscripts);
  }

  resetView() {
    myGlobals.setCompareMode(false);
    myGlobals.setDiffMode(false);
    this.profileManuscripts = this.originalManuscripts;
  }

  setChapter(chapter: number) {
    console.log('chap: ' + chapter);
    this.chapterNum = chapter - 1;
  }

  setV1(v1: number) {
    console.log('v1: ' + v1);
    this.v1 = v1;
  }

  setV2(v2: number) {
    console.log('v2: ' + v2);
    this.v2 = v2;
  }

  setPage(page: number) {
    console.log('page: ' + page);
    this.pageNum = page - 1;
  }


}
