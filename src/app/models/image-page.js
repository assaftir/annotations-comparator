"use strict";
exports.__esModule = true;
var ImagePage = /** @class */ (function () {
    function ImagePage() {
        this.isChanges = false;
    }
    ImagePage.logImagePage = function (imagePage) {
        var message = 'Image page \n';
        message += 'pageNumber ' + imagePage.pageNumber + '\n';
        // TO DO
    };
    return ImagePage;
}());
exports.ImagePage = ImagePage;
var ImageLayers = /** @class */ (function () {
    function ImageLayers() {
        this.annotationLayer = new Array();
        this.polygonLayer = new Array();
        this.polylineLayer = new Array();
    }
    return ImageLayers;
}());
exports.ImageLayers = ImageLayers;
var Pixel = /** @class */ (function () {
    function Pixel(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }
    return Pixel;
}());
exports.Pixel = Pixel;
var TextboxNote = /** @class */ (function () {
    function TextboxNote() {
    }
    TextboxNote.IsTextboxNoteContainThePoint = function (tb, pos) {
        return ((tb.startPoint.x <= pos.x) &&
            (pos.x <= (tb.startPoint.x + tb.width)) &&
            (tb.startPoint.y <= pos.y) &&
            (pos.y <= (tb.startPoint.y + tb.height)));
    };
    return TextboxNote;
}());
exports.TextboxNote = TextboxNote;
var Polygon = /** @class */ (function () {
    function Polygon() {
        this.vertices = new Array();
    }
    Polygon.IsPolygonContainThePoint = function (pl, pos) {
        var inside = false;
        for (var i = 0, j = pl.vertices.length - 1; i < pl.vertices.length; j = i++) {
            var xi = pl.vertices[i].x;
            var yi = pl.vertices[i].y;
            var xj = pl.vertices[j].x;
            var yj = pl.vertices[j].y;
            var intersect = ((yi > pos.y) !== (yj > pos.y)) && (pos.x < (xj - xi) * (pos.y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    };
    Polygon.prototype.Clone = function () {
        var clonePoly = new Polygon();
        this.vertices.forEach(function (vertex) {
            clonePoly.vertices.push(new Pixel(vertex));
        });
        return clonePoly;
    };
    return Polygon;
}());
exports.Polygon = Polygon;
var Polyline = /** @class */ (function () {
    function Polyline() {
        this.vertices = new Array();
    }
    Polyline.IsPolylineNearThePoint = function (polyline, pos) {
        var threshold = 5;
        var minDistancePosToPolyline = 10000;
        for (var index = 0; index < polyline.vertices.length - 1; index++) {
            var lineStart = polyline.vertices[index];
            var lineEnd = polyline.vertices[index + 1];
            var dist = this.distToSegment(pos, lineStart, lineEnd);
            if (minDistancePosToPolyline > dist) {
                minDistancePosToPolyline = dist;
            }
        }
        return (minDistancePosToPolyline < threshold);
    };
    Polyline.sqr = function (x) { return x * x; };
    Polyline.dist2 = function (v, w) { return this.sqr(v.x - w.x) + this.sqr(v.y - w.y); };
    Polyline.distToSegmentSquared = function (pos, v, w) {
        var l2 = this.dist2(v, w);
        if (l2 === 0) {
            return this.dist2(pos, v);
        }
        var t = ((pos.x - v.x) * (w.x - v.x) + (pos.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.dist2(pos, { x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y) });
    };
    Polyline.distToSegment = function (pos, v, w) { return Math.sqrt(this.distToSegmentSquared(pos, v, w)); };
    Polyline.prototype.Clone = function () {
        var clonePolyline = new Polyline();
        this.vertices.forEach(function (vertex) {
            clonePolyline.vertices.push(new Pixel(vertex));
        });
        return clonePolyline;
    };
    return Polyline;
}());
exports.Polyline = Polyline;
