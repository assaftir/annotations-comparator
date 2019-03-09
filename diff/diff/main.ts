import { Manuscript } from "../src/app/models/manuscript";
import { ImagePage, TextboxNote } from "../src/app/models/image-page";
require('colors');
var jsdiff = require('diff');
var json = require("C:\\Users\\Assaf\\Documents\\tiip191\\ngx-manusctipts-viewer\\src\\api\\manuscripts.json");

const xDelta = 30;
const yDelta = 30;
//Pick a chapter
const chapter_1 : Manuscript = json[0];
//Pick page number
let page : ImagePage = chapter_1.pages[0];
//Pick versions to comapre
let versionOne : number = 1;
let versionTwo : number = 2;
/* Compares page versions, versionOne vs versionTwo and prints the results */
comaprePageAnnotations(page, versionOne, versionTwo);

function comaprePageAnnotations(page : ImagePage, firstVersion : number, secondVersion : number) {
    let firstVersionPageAnnotations : TextboxNote[] = page.version[firstVersion].annotationLayer;
    let secondVersionPageAnnotations : TextboxNote[] = page.version[secondVersion].annotationLayer;
    if(firstVersionPageAnnotations == undefined || secondVersionPageAnnotations == undefined){
        return null;
    }
    for (let i = 0 ; i < firstVersionPageAnnotations.length ; i++) {
        for(let j = 0 ; j < secondVersionPageAnnotations.length ; j++){
            if(!isSameAnnotation(firstVersionPageAnnotations[i], secondVersionPageAnnotations[j])){
                continue;
            }
            /* We have a possible match, proccess it by diff and add it to the diffs array */         
            var diff = jsdiff.diffChars(firstVersionPageAnnotations[i].textNote, secondVersionPageAnnotations[j].textNote);
            diff.forEach(function(part){
                var color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
                process.stderr.write(part.value[color]);
            });
            console.log();
        }
    }
}

function isSameAnnotation(firstTextBox : TextboxNote, secondTextBox : TextboxNote) {
    let firstStartPoint = firstTextBox.startPoint;
    let secondStartPoint = secondTextBox.startPoint;
    return (Math.abs(firstStartPoint.x - secondStartPoint.x) < xDelta &&
            Math.abs(firstStartPoint.y - secondStartPoint.y) < yDelta)
}    

/* (0,0) is at top left */
