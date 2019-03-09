"use strict";
exports.__esModule = true;
require('colors');
var http = require('http');
var jsdiff = require('diff');
var json = require("C:\\Users\\Assaf\\Documents\\tiip191\\ngx-manusctipts-viewer\\src\\api\\manuscripts.json");
var xDelta = 30;
var yDelta = 30;
//Pick a chapter
var chapter_1 = json[0];
//Pick page number
var page = chapter_1.pages[0];
//Pick versions to comapre
var versionOne = 1;
var versionTwo = 2;
/* Compares page versions, versionOne vs versionTwo and prints the results */
comaprePageAnnotations(page, versionOne, versionTwo);
function comaprePageAnnotations(page, firstVersion, secondVersion) {
    var firstVersionPageAnnotations = page.version[firstVersion].annotationLayer;
    var secondVersionPageAnnotations = page.version[secondVersion].annotationLayer;
    if (firstVersionPageAnnotations == undefined || secondVersionPageAnnotations == undefined) {
        return null;
    }
    for (var i = 0; i < firstVersionPageAnnotations.length; i++) {
        for (var j = 0; j < secondVersionPageAnnotations.length; j++) {
            if (!isSameAnnotation(firstVersionPageAnnotations[i], secondVersionPageAnnotations[j])) {
                continue;
            }
            /* We have a possible match, proccess it by diff and add it to the diffs array */
            var firstTextBox = firstVersionPageAnnotations[i];
            var secondTextBox = secondVersionPageAnnotations[j];
            var diff = jsdiff.diffChars(firstTextBox.textNote, secondTextBox.textNote);
            console.log("----------");
            console.log("X startPoint: {" + firstTextBox.startPoint.x + "} ; Y startPoint: {" + firstTextBox.startPoint.y + "}");
            console.log("Height: {" + firstTextBox.height + "} ; " + "Width: {" + firstTextBox.width + "}");
            diff.forEach(function (part) {
                var color = part.added ? 'green' :
                    part.removed ? 'red' : 'grey';
                process.stderr.write(part.value[color]);
            });
            console.log();
        }
    }
}
function isSameAnnotation(firstTextBox, secondTextBox) {
    var firstStartPoint = firstTextBox.startPoint;
    var secondStartPoint = secondTextBox.startPoint;
    return (Math.abs(firstStartPoint.x - secondStartPoint.x) < xDelta &&
        Math.abs(firstStartPoint.y - secondStartPoint.y) < yDelta);
}
/* (0,0) is at top left */
http.createServer(function (req, res) {
    var body = "Select json file: <br>\
                <input type='file' id='input'/>\
                <input type='button' onclick='loadJSON()' value='load json' />\
                <form id='frm1' action='/action_page.php'>\
                    Type chapter number:<br>\
                    <input type='number' name='Chapter'><br>\
                    Type page number:<br>\
                    <input type='number' name='Page'><br>\
                    Type first version number:<br>\
                    <input type='number' name='versionOne'><br>\
                    Type second version number:<br>\
                    <input type='number' name='versionTwo'><br>\
                </form> <p id='jsonFile'></p>\
                <p id='chapter'></p>\
                <p id='page'></p>\
                <p id='versionOne'></p>\
                <p id='versionTwo'></p>\
                <p id='diffs'></p>\
                <h1>Compare Annotations</h1>\
                <button onclick='comaprePageAnnotations(page, versionOne, versionTwo)'>Comapre</button>\
                <button onclick='getUserInput()'>Display user input</button>";
    var json_loader = "function loadJSON() {\
     var inputField = document.getElementById('input');\
        var fr = null;\
        if (input.files && input.files[0]) {\
            fr = new FileReader();\
            fr.onload = function() {\
                alert(fr.result);\
                document.getElementById('jsonFile').innerHTML = JSON.parse(fr.result);\
            };\
            fr.readAsText(inputField.files[0]);\
        }else\
            alert('please select a file');\
    }";
    var user_input_loader = "function getUserInput() {\
        var x = document.getElementById('frm1');\
        document.getElementById('chapter').innerHTML = x.elements[0].value;\
        document.getElementById('page').innerHTML = x.elements[1].value;\
        document.getElementById('versionOne').innerHTML = x.elements[2].value;\
        document.getElementById('versionTwo').innerHTML = x.elements[3].value;\
      }";
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("<body>");
    res.write(body);
    res.write("</body>");
    res.write("<script>");
    res.write(json_loader);
    res.write(user_input_loader);
    res.write("</script>");
    res.end();
}).listen(8080);
