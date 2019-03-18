import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, throwError  } from 'rxjs';
import { tap , catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { Manuscript } from '../models/manuscript';
import { ImagePage } from '../models/image-page';

@Injectable()
export class ManuscriptService {
    public _imageUrl = './api/manuscripts.json';
    public profileManuscripts: Manuscript[]; 
    // this option is a server url
    // private _imageUrl = 'http://localhost:65267/api/images';

    constructor(private _http: HttpClient) {

    }

    public postImagPageToManuscript(manuscriptID: string , imagePage: string) {
      const urlPosting = 'http://localhost:4200/' + manuscriptID;
      console.log('posting to: ' + urlPosting);
      return this._http.post(manuscriptID, imagePage);
    }

    public getManuscriptOfUser(imageUrl): Observable<Manuscript[]> {
       return this._http.get<Manuscript[]>(imageUrl)
                  .pipe(
                  tap(data => console.log('All: '/*  + JSON.stringify(data) */))
                  , catchError(this.handleError)
              );
    }
    //MongoDB server must be running
    public fetchFromDB(imageUrl) {
        return this._http.get<any>(imageUrl)
                   .pipe(
                   tap(data => console.log('Fetching from MongoDB'))
                   , catchError(this.handleError)
               );
     }

    private handleError(err: HttpErrorResponse) {
        console.log(err.message);
        return throwError(err.message);
    }


}
