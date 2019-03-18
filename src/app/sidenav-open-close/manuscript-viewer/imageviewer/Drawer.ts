import { MatrixTransformer } from './Geo';
import { TextboxNote, Polygon, Polyline } from '../../../models/image-page';
import { SystemState } from './enums';
import * as Diff from '../../../../../node_modules/diff';
import * as myGlobals from '../../../../../src/globals';
import { SidenavOpenCloseComponent } from '../../sidenav-open-close.component';
export class Drawer {

  static drawPointerCanvas(ctx, mt: MatrixTransformer,  x: number, y: number , systemState: SystemState) {
    // preserve context
    ctx.save();
    ctx.setTransform(mt.matrix[0], mt.matrix[1], mt.matrix[2], mt.matrix[3], mt.matrix[4], mt.matrix[5]);
    
    switch (systemState) {
      case SystemState.AddNotation: {
         // drawing pulse sign
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x, y + 20 );
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x + 20, y);
        ctx.stroke();
        break;
      }
      case SystemState.AddPolygon: {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.fillStyle = 'green';
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
     }
      default: {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.fillStyle = 'red';
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
      }
    }
    // restore context
    ctx.restore();
  }

  static drawSystemStateOnCanvas(ctx , systemState: SystemState) {
     // preserve context
     ctx.save();
     ctx.font  = '15px Arial';
     ctx.fillStyle = 'red';
     ctx.strokeStyle = 'black';

     switch (systemState) {
       case SystemState.AddNotation: {
         ctx.fillText('Add Notation Mode', 0, 20);
         break;
       }
       case SystemState.AddPolygon: {
        ctx.fillText('Add Polygon Mode', 0, 20);
        break;
      }
      case SystemState.AddPolyline: {
        ctx.fillText('Add Polyline Mode', 0, 20);
        break;
      }
       case SystemState.DeleteMode: {
        ctx.fillText('Delete Mode', 0, 20);
        break;
      }
       default: {
       }
     }

     // restore context
     ctx.restore();
  }

  static drawImageAnnotationLayer(ctx, annotationLayer: TextboxNote[], startX: number , startY: number) {
    // preserve context
    ctx.save();

    ctx.globalAlpha = 0.5;
    annotationLayer.forEach(textboxNote => {
        ctx.beginPath();
        ctx.lineWidth = '1';
        if(myGlobals.compareMode){
          ctx.fillStyle = this.getColorForTextbox(textboxNote);
        } else{
          ctx.fillStyle = 'blue';
        }
        ctx.strokeStyle = 'black';
        ctx.rect(startX + textboxNote.startPoint.x, startY + textboxNote.startPoint.y, textboxNote.width, textboxNote.height);
        ctx.stroke();
        ctx.fill();
    });
     // restore context
     ctx.restore();
  }

  static getColorForTextbox(textboxNote : TextboxNote){
    var textNote : string = textboxNote.textNote;
    var nums = textNote.split(/\W/).filter(i => parseInt(i) > -1).map(Number);
    var max : Number = this.findMax(nums);
    var sum : Number = this.arraySum(nums);
    var color : string = this.getColorByValue(max, sum)
    return color;
  }

  static findMax(arr : Number[]){
    var max : Number = arr[0];
    for(let i = 0 ; i < arr.length ; i++){
      if(arr[i] > max)
        max = arr[i];
    }
    return max;
  }

  static arraySum(arr : Number[]){
    var sum : number = 0;
    for (let i = 0 ; i < arr.length ; i++){
      sum += arr[i].valueOf();
      /* sum. */
    }
    return Number(sum);
  }

  static getColorByValue(max : Number, sum : Number){
    const val = max.valueOf() / sum.valueOf();
    if(sum == 1){
      return 'blue';
    }
    if(val == 1){
      return 'green';
    } else if(sum == 2){
      if(val == 1){
        return 'green'; 
      } else {
        return 'red';
      }
    } else {
      switch(true){
        case(val > 0 && val <= 0.2):
          return 'red';

        case(val > 0.2 && val <= 0.4):
          return 'salmon';
        
        case(val > 0.4 && val <= 0.6):
          return 'orange';
        
        case(val > 0.6 && val <= 0.8):
          return 'yellow';
        
        case(val > 0.8 && val < 1):
          return 'mediumspringgreen';
        
      }
    }
  }

  static drawPolygonsLayer(ctx, polygonLayer: Polygon[], startX: number , startY: number) {
     // preserve context
     ctx.save();

     polygonLayer.forEach(polygon => {
        this.drawPolygon(ctx, polygon, startX, startY, 0.3);
     });
    // restore context
     ctx.restore();
  }

  static drawPolygon(ctx, polygon: Polygon, startX: number , startY: number , globalAlpha: number) {
    ctx.lineWidth = '1';
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'black';
    ctx.globalAlpha = globalAlpha;
    ctx.beginPath();

   ctx.moveTo(polygon.vertices[0].x + startX, polygon.vertices[0].y + startY);

   for (let index = 1; index < polygon.vertices.length; index++) {
     const vertex = polygon.vertices[index];
     ctx.lineTo(vertex.x + startX, vertex.y + startY);
   }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  static drawPolygonCanvasWorld(ctx, mt: MatrixTransformer, polygon: Polygon ) {
      // preserve context
      ctx.save();

      ctx.globalAlpha = 0.3;
      ctx.setTransform(mt.matrix[0], mt.matrix[1], mt.matrix[2], mt.matrix[3], mt.matrix[4], mt.matrix[5]);
      this.drawPolygon(ctx, polygon, 0, 0, 0.2);
      ctx.globalAlpha = 1.0;

      // restore context
      ctx.restore();
  }

  static drawPolylineCanvasWorld(ctx, mt: MatrixTransformer, polyline: Polyline ) {
    // preserve context
    ctx.save();

    ctx.globalAlpha = 0.3;
    ctx.setTransform(mt.matrix[0], mt.matrix[1], mt.matrix[2], mt.matrix[3], mt.matrix[4], mt.matrix[5]);
    this.drawPolyline(ctx, polyline, 0, 0, 0.3);
    ctx.globalAlpha = 1.0;

    // restore context
    ctx.restore();
}

  static drawPolylineLayer(ctx, polylineLayer: Polyline[], startX: number , startY: number) {
    // preserve context
    ctx.save();

    polylineLayer.forEach(polyline => {
       this.drawPolyline(ctx, polyline, startX, startY, 0.3);
    });
   // restore context
    ctx.restore();
 }

 static drawPolyline(ctx, polyline: Polyline, startX: number , startY: number , globalAlpha: number) {
  ctx.lineWidth = '4';
  ctx.strokeStyle = 'red';
  ctx.globalAlpha = globalAlpha;
  ctx.beginPath();

  ctx.moveTo(polyline.vertices[0].x + startX, polyline.vertices[0].y + startY);

  for (let index = 1; index < polyline.vertices.length; index++) {
    const vertex = polyline.vertices[index];
    ctx.lineTo(vertex.x + startX, vertex.y + startY);
  }
  ctx.stroke();
}

  static drawTextBoxBolder(ctx, textboxNote: TextboxNote, startX: number , startY: number) {
      // preserve context
      ctx.save();
      ctx.globalAlpha = 0.2;

      ctx.beginPath();
      ctx.lineWidth = '1';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.rect(startX + textboxNote.startPoint.x, startY + textboxNote.startPoint.y, textboxNote.width, textboxNote.height);
      ctx.stroke();
      ctx.fill();

      ctx.globalAlpha = 1.0;
      // restore context
      ctx.restore();
  }

  static drawRoundRectangle(ctx, x, y, width, height, radius, fill, stroke) {
    radius = (typeof radius === 'number') ? radius : 5;
    fill = (typeof fill === 'boolean') ? fill : true; // fill = default
    stroke = (typeof stroke === 'boolean') ? stroke : false;

    // draw round rectangle
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fill) { ctx.fill(); }
    if (stroke) { ctx.stroke(); }
  }

  static drawNotationBox(ctx, pos: { x: number, y: number } , canvasWidth: number, canvasHeight: number  , textNote: string) {
    // preserve context
    ctx.save();

    const maxWidth = 300;
    const lineHeight = 20;
    ctx.font = '13pt Calibri';
    ctx.fillStyle = '#333';
    if(myGlobals.diffMode)
      this.wrapTextDiff(ctx, textNote, pos.x, pos.y, maxWidth , lineHeight , canvasWidth , canvasHeight);
    else
      this.wrapText(ctx, textNote, pos.x, pos.y, maxWidth , lineHeight , canvasWidth , canvasHeight);

     // restore context
     ctx.restore();
  }

  static wrapTextDiff(ctx, text, x, y, maxWidth, lineHeight , canvasWidth , canvasHeight) {
    if (text == null) {return; }
    let backRectHeight = lineHeight;
    const words = text.split('-----');
    if(words.length == 1){
      this.wrapText(ctx, text, x, y, maxWidth , lineHeight , canvasWidth , canvasHeight);
      return;
    }
    // deal when the box is over the edges of the canvas
    // TODO - make the code more read
    const yDeltaForMouseSize = 18;
    if (x + maxWidth <= canvasWidth) {
      if (y + yDeltaForMouseSize + backRectHeight <= canvasHeight) {
      this.drawBoxAndTextDiff(ctx, x, y + yDeltaForMouseSize, maxWidth, backRectHeight , lineHeight, words );
      } else {
      this.drawBoxAndTextDiff(ctx, x, y - yDeltaForMouseSize - backRectHeight, maxWidth, backRectHeight , lineHeight, words );
      }
    } else {
      if (y + yDeltaForMouseSize + backRectHeight <= canvasHeight) {
        this.drawBoxAndTextDiff(ctx,  x - maxWidth , y + yDeltaForMouseSize, maxWidth, backRectHeight, lineHeight, words );
        } else {
          this.drawBoxAndTextDiff(ctx,  x - maxWidth , y - yDeltaForMouseSize - backRectHeight , maxWidth, backRectHeight, lineHeight, words );
        }
    }
  }

  static wrapText(ctx, text, x, y, maxWidth, lineHeight , canvasWidth , canvasHeight) {
    if (text == null) {return; }
    let backRectHeight = lineHeight;

    const LINES = [];
    const words = text.split(' ');
    let line = '';

    // Split to lines
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if ((testWidth > maxWidth && n > 0) || words[n] == '-----') {
        LINES.push(line);
        if(words[n] == '-----'){
          line = '';
        } else {
          line = words[n] + ' ';
        }
        backRectHeight += lineHeight;
      } else {
        line = testLine;
      }
    }
    LINES.push(line);


    // deal when the box is over the edges of the canvas
    // TODO - make the code more read
    const yDeltaForMouseSize = 18;
    if (x + maxWidth <= canvasWidth) {
      if (y + yDeltaForMouseSize + backRectHeight <= canvasHeight) {
      this.drawBoxAndText(ctx, x, y + yDeltaForMouseSize, maxWidth, backRectHeight , lineHeight, LINES );
      } else {
      this.drawBoxAndText(ctx, x, y - yDeltaForMouseSize - backRectHeight, maxWidth, backRectHeight , lineHeight, LINES );
      }
    } else {
      if (y + yDeltaForMouseSize + backRectHeight <= canvasHeight) {
        this.drawBoxAndText(ctx,  x - maxWidth , y + yDeltaForMouseSize, maxWidth, backRectHeight, lineHeight, LINES );
        } else {
          this.drawBoxAndText(ctx,  x - maxWidth , y - yDeltaForMouseSize - backRectHeight , maxWidth, backRectHeight, lineHeight, LINES );
        }
    }
  }

  static getPartColor(part: any): string {
    if (part.added) {
      return 'green';
    } else if (part.removed) {
      return 'red';
    } else {
      return 'black';
    }
  }

  static splitLongString(ctx, str : string){
    const LINES = [];
    const words = str.split(' ');
    let line = '';
    const maxWidth = 300;
    // Split to lines
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        LINES.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    LINES.push(line);
    return LINES;
  }

  static drawBoxAndTextDiff(ctx, x, y, backRectWidth, backRecHeight, lineHeight, LINES) {

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = '1';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';

    var longestLine;
    if(LINES[0].length > LINES[1].length)
      longestLine = LINES[0];
    else
      longestLine = LINES[1];

    var linesTest = this.splitLongString(ctx, longestLine);  
    ctx.rect(x, y, backRectWidth + 100, lineHeight * (linesTest.length + 1));
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    let result = Diff.diffWords(LINES[0], LINES[1]);
    let nextX = x;
    let nextY = y + lineHeight;
    var lastColor;
    var space = 0;
    for(let i = 0 ; i < result.length; i++){
      ctx.fillStyle = this.getPartColor(result[i]);
      if(lastColor != undefined && (lastColor == 'green' && (this.getPartColor(result[i]) == 'red') || this.getPartColor(result[i]) == 'black') || (lastColor == 'red' && this.getPartColor(result[i]) == 'green')){
        space = ctx.measureText(" ").width;
      } else {
        space = 0;
      }
      if(ctx.measureText(result[i].value).width > backRectWidth + 100){
        var lines = this.splitLongString(ctx, result[i].value);
        for(let i = 0 ; i < lines.length ; i++){
          ctx.fillText(lines[i], nextX + space, nextY);
          nextX = x;
          nextY += lineHeight;
        }
      } else {
        ctx.fillText(result[i].value, nextX + space, nextY);
        nextX += (ctx.measureText(result[i].value).width);
        if(nextX - x > backRectWidth){
          nextX = x;
          nextY += lineHeight;
        }
      }
      lastColor = this.getPartColor(result[i]);
    }
  }

  static drawBoxAndText(ctx, x, y, backRectWidth, backRecHeight, lineHeight, LINES) {

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = '1';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.rect(x, y, backRectWidth, backRecHeight + lineHeight / 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    // draw lines
    let theNextLiney = y + lineHeight;
    for (let index = 0; index < LINES.length; index++) {
      const lineToDraw = LINES[index];
      ctx.fillText(lineToDraw, x, theNextLiney);
      theNextLiney += lineHeight;
    }
  }

  static DrawRectangle(ctx, mt: MatrixTransformer, startPos, width , height) {
     // preserve context
     ctx.save();

     ctx.globalAlpha = 0.3;
     ctx.setTransform(mt.matrix[0], mt.matrix[1], mt.matrix[2], mt.matrix[3], mt.matrix[4], mt.matrix[5]);

     ctx.beginPath();
     ctx.lineWidth = '1';
     ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'red';
     ctx.rect(startPos.x , startPos.y, width, height);
     ctx.stroke();
     ctx.fill();

     ctx.globalAlpha = 1.0;
     // restore context
     ctx.restore();
  }
}
