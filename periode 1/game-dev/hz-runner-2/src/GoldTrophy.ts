/// <reference path="ScoringObject.ts"/>

class GoldTrophy extends ScoringObject {

    public constructor (canvas: HTMLCanvasElement, lanes: number[]) {
        // first run parent (abstract - Scoring object) than continue with this.image:
        super(canvas, lanes);
        this.image = this.loadNewImage("assets/img/objects/gold_trophy.png");
        this.points = 10;
    }

}