class GameItem {
    constructor(image, position, speed, angle, angularSpeed, offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW) {
        this._image = image;
        this._position = position;
        this._speed = speed;
        this._angle = angle;
        this._angularSpeed = angularSpeed;
        this._offscreenBehaviour = offscreenBehaviour;
    }
    get collisionRadius() {
        return this._image.height / 2;
    }
    get position() {
        return this._position;
    }
    get speed() {
        return this._speed;
    }
    move(canvas) {
        this._position = new Vector(this._position.x + this._speed.x, this._position.y - this._speed.y);
        switch (this._offscreenBehaviour) {
            case GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW:
                this.adjustOverflow(canvas.width, canvas.height);
                break;
            case GameItem.OFFSCREEN_BEHAVIOUR_BOUNCE:
                break;
            case GameItem.OFFSCREEN_BEHAVIOUR_DIE:
                this.adjustDie(canvas.width, canvas.height);
                break;
        }
        this._angle += this._angularSpeed;
    }
    adjustOverflow(maxX, maxY) {
        if (this._position.x > maxX) {
            this._position = new Vector(-this._image.width, this._position.y);
        }
        else if (this._position.x < -this._image.width) {
            this._position = new Vector(maxX, this._position.y);
        }
        if (this._position.y > maxY + this._image.height / 2) {
            this._position = new Vector(this._position.x, -this._image.height / 2);
        }
        else if (this._position.y < -this._image.height / 2) {
            this._position = new Vector(this._position.x, maxY);
        }
    }
    adjustDie(maxX, maxY) {
        if (this._position.x + this._image.width > maxX || this._position.x < 0 ||
            this._position.y + this._image.height / 2 > maxY ||
            this._position.y - this._image.height / 2 < 0) {
            this.die();
        }
    }
    die() {
        this._state = GameItem.STATE_DEAD;
    }
    isDead() {
        return this._state == GameItem.STATE_DEAD;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._angle);
        ctx.drawImage(this._image, -this._image.width / 2, -this._image.height / 2);
        ctx.restore();
    }
    drawDebug(ctx) {
        ctx.save();
        ctx.strokeStyle = '#ffffb3';
        ctx.beginPath();
        this.drawCenterInfo(ctx);
        this.drawCollisionBounds(ctx);
        ctx.stroke();
        ctx.restore();
    }
    drawCenterInfo(ctx) {
        ctx.moveTo(this._position.x - 50, this._position.y);
        ctx.lineTo(this._position.x + 50, this._position.y);
        ctx.moveTo(this._position.x, this._position.y - 50);
        ctx.lineTo(this._position.x, this._position.y + 50);
        const text = `(${this._position.x.toPrecision(3)},${this._position.y.toPrecision(3)})`;
        ctx.font = `10px courier`;
        ctx.textAlign = 'left';
        ctx.fillText(text, this._position.x + 10, this._position.y - 10);
    }
    drawCollisionBounds(ctx) {
        ctx.moveTo(this._position.x, this._position.y);
        ctx.arc(this._position.x, this._position.y, this._image.width / 2, 0, 2 * Math.PI, false);
    }
}
GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW = 0;
GameItem.OFFSCREEN_BEHAVIOUR_BOUNCE = 2;
GameItem.OFFSCREEN_BEHAVIOUR_DIE = 3;
GameItem.STATE_ALIVE = 0;
GameItem.STATE_DYING = 8;
GameItem.STATE_DEAD = 9;
class Block extends GameItem {
    constructor(image, blockHeight, blockWidth) {
        super(image, null, new Vector(0, -Tetris.blockSize), 0, 0);
        this._blockHeight = blockHeight;
        this._blockWidth = blockWidth;
    }
    get blockHeight() {
        return this._blockHeight;
    }
    get blockWidth() {
        return this._blockWidth;
    }
    moveLeft() {
        const leftSidePlayingField = this.playingFieldPosition.x - this.playingFieldSize.x / 2;
        const leftSideBlock = this.position.x - (this.blockWidth / 2) * Tetris.blockSize;
        if (leftSideBlock - Tetris.blockSize >= leftSidePlayingField) {
            this._position = new Vector(this._position.x - Tetris.blockSize, this._position.y);
        }
    }
    moveRight() {
        const rightSidePlayingField = this.playingFieldPosition.x + this.playingFieldSize.x / 2;
        const rightSideBlock = this.position.x + (this.blockWidth / 2) * Tetris.blockSize;
        console.log(rightSidePlayingField, rightSideBlock);
        if (rightSideBlock + Tetris.blockSize <= rightSidePlayingField) {
            this._position = new Vector(this._position.x + Tetris.blockSize, this._position.y);
        }
    }
    updatePlayingField(playingFieldPosition, playingFieldSize) {
        this.playingFieldPosition = playingFieldPosition;
        this.playingFieldSize = playingFieldSize;
    }
    draw(ctx) {
        if (this.position === null) {
            const leftSide = this.playingFieldPosition.x - this.playingFieldSize.x / 2;
            let initialXPosition = leftSide + 3 * Tetris.blockSize;
            if (this.blockWidth % 2 !== 0) {
                initialXPosition += 22;
            }
            const bottom = this.playingFieldPosition.y + this.playingFieldSize.y / 2;
            let initialYPosition = bottom - 13 * Tetris.blockSize;
            if (this.blockHeight % 2 !== 0) {
                initialYPosition += 22;
            }
            this._position = new Vector(initialXPosition, initialYPosition);
        }
        super.draw(ctx);
    }
}
class IBlock extends Block {
    constructor(image) {
        super(image, 4, 1);
    }
}
class LBlock extends Block {
    constructor(image) {
        super(image, 3, 2);
    }
}
class View {
    constructor() {
        this.center = new Vector();
        this.size = new Vector();
        this.isDebugKeysDown = false;
    }
    init(game) {
        this.game = game;
    }
    listen(input) {
        if (input.keyboard.isKeyDown(Input.KEY_CTRL)
            && input.keyboard.isKeyDown(Input.KEY_ALT)
            && input.keyboard.isKeyDown(Input.KEY_D)) {
            if (!this.isDebugKeysDown) {
                this.game.session.debug = !this.game.session.debug;
                this.isDebugKeysDown = true;
                console.log("Debug is set to " + this.game.session.debug);
            }
        }
        else {
            this.isDebugKeysDown = false;
        }
    }
    move(canvas) {
        this.size = new Vector(canvas.width, canvas.height);
        this.center = this.size.scale(0.5);
    }
    adjust(game) { }
    prepareDraw(ctx) {
        ctx.clearRect(0, 0, this.size.x, this.size.y);
    }
    draw(ctx) {
    }
    drawDebug(ctx) {
        ctx.save();
        ctx.translate(this.size.x - 123, this.size.y - 17);
        ctx.fillStyle = 'white';
        const text = `${this.game.timing.fps.toFixed(1)}fps`;
        ctx.font = `12px courier`;
        ctx.textAlign = 'left';
        ctx.fillText(text, 0, 0);
        let x = this.size.x - 120;
        let y = this.size.y - 15;
        ctx.fillRect(0, 3, 102, 10);
        let green = 255 - Math.round(255 * this.game.timing.load);
        let red = 255 - green;
        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
        ctx.fillRect(1, 4, 100 * this.game.timing.load, 8);
        ctx.restore();
    }
    writeTextToCanvas(ctx, text, fontSize = 20, xCoordinate, yCoordinate, alignment = "center", color = "white") {
        ctx.font = `${fontSize}px Minecraft`;
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.fillText(text, xCoordinate, yCoordinate);
    }
    drawImage(ctx, image, xCoordinate, yCoordinate, angle = 0) {
        ctx.save();
        ctx.translate(xCoordinate, yCoordinate);
        ctx.rotate(angle);
        ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
        ctx.restore();
    }
}
class LevelView extends View {
    constructor() {
        super(...arguments);
        this.lastMoveDown = performance.now();
        this.lastMove = performance.now();
        this.backgroundSize = new Vector(446, 700);
    }
    init(game) {
        super.init(game);
        this.background = game.repo.getImage("background");
        this.playingField = new PlayingField(game, 5);
    }
    listen(input) {
        super.listen(input);
        const timeSinceLastMove = performance.now() - this.lastMove;
        if (timeSinceLastMove > 200) {
            if (input.keyboard.isKeyDown(Input.KEY_LEFT)) {
                this.playingField.moveLeft();
                this.lastMove = performance.now();
            }
            if (input.keyboard.isKeyDown(Input.KEY_RIGHT)) {
                this.playingField.moveRight();
                this.lastMove = performance.now();
            }
        }
    }
    draw(ctx) {
        this.background.width = this.backgroundSize.x;
        this.background.height = this.backgroundSize.y;
        this.backgroundPosition = new Vector(this.center.x, this.background.height / 2 + 30);
        const backgroundTopLeft = new Vector(this.backgroundPosition.x - this.backgroundSize.x / 2, this.backgroundPosition.y - this.backgroundSize.y / 2);
        super.draw(ctx);
        this.drawImage(ctx, this.background, this.backgroundPosition.x, this.backgroundPosition.y);
        this.playingField.draw(ctx, backgroundTopLeft.x, backgroundTopLeft.y);
    }
    move(canvas) {
        if (this.playingField.stillMoreBlocks()) {
            super.move(canvas);
            this.lastMoveDown = this.playingField.moveDown(canvas, this.lastMoveDown);
        }
        else {
        }
    }
}
class PlayingField {
    constructor(game, amountOfBlocks) {
        this.size = new Vector(308, 618);
        this.availableBlocks = ["I", "L", "R", "S", "T"];
        this.leftOverBlocks = [];
        this.delay = 250;
        this.blocksInPlay = [];
        this.amountOfBlocks = amountOfBlocks;
        for (let i = 0; i < this.amountOfBlocks; i++) {
            this.leftOverBlocks.push(this.createNewMovingBlock(game));
        }
        this.movingBlock = this.leftOverBlocks.shift();
    }
    draw(ctx, backgroundTopLeftX, backgroundTopLeftY) {
        this.blocksInPlay.forEach(block => {
            block.draw(ctx);
        });
        this.position = new Vector(12 + backgroundTopLeftX + this.size.x / 2, 68 + backgroundTopLeftY + this.size.y / 2);
        this.movingBlock.updatePlayingField(this.position, this.size);
        this.movingBlock.draw(ctx);
    }
    getRandomBlock() {
        return this.availableBlocks[Game.randomInteger(0, this.availableBlocks.length - 1)];
    }
    createNewMovingBlock(game) {
        const randomBlock = this.getRandomBlock();
        switch (randomBlock) {
            case "I":
                return new IBlock(game.repo.getImage(randomBlock));
            case "L":
                return new LBlock(game.repo.getImage(randomBlock));
            case "R":
                return new RBlock(game.repo.getImage(randomBlock));
            case "S":
                return new SBlock(game.repo.getImage(randomBlock));
            default:
                return new TBlock(game.repo.getImage(randomBlock));
        }
    }
    moveDown(canvas, lastMoveDown) {
        if (this.movingBlock.position !== null && performance.now() - lastMoveDown > this.delay) {
            lastMoveDown = performance.now();
            this.movingBlock.move(canvas);
            const bottomField = this.position.y + this.size.y / 2;
            const bottomBlock = this.movingBlock.position.y + (this.movingBlock.blockHeight / 2) * Tetris.blockSize;
            if (bottomField === bottomBlock) {
                this.blocksInPlay.push(this.movingBlock);
                this.movingBlock = this.leftOverBlocks.shift();
            }
        }
        return lastMoveDown;
    }
    stillMoreBlocks() {
        return !(this.leftOverBlocks.length == 0);
    }
    moveLeft() {
        this.movingBlock.moveLeft();
    }
    moveRight() {
        this.movingBlock.moveRight();
    }
}
class RBlock extends Block {
    constructor(image) {
        super(image, 2, 2);
    }
}
class SBlock extends Block {
    constructor(image) {
        super(image, 2, 3);
    }
}
class StartView extends View {
    constructor() {
        super(...arguments);
        this.shouldGoToNextView = false;
    }
    init(game) {
        super.init(game);
    }
    listen(input) {
        super.listen(input);
        if (input.keyboard.isKeyDown(Input.KEY_S)) {
            this.shouldGoToNextView = true;
        }
    }
    adjust(game) {
        if (this.shouldGoToNextView) {
            game.switchViewTo('level');
        }
    }
    draw(ctx) {
        this.writeTextToCanvas(ctx, "Just not Tetris", 140, this.center.x, 150, 'center', 'black');
        this.writeTextToCanvas(ctx, "HIT 'S' TO START", 40, this.center.x, this.center.y - 135, 'center', 'black');
    }
}
class TBlock extends Block {
    constructor(image) {
        super(image, 2, 3);
    }
}
class Game {
    constructor(canvasId) {
        this.input = new Input();
        this.session = { debug: false };
        this.timing = new Timing();
        this.animate = () => {
            this.timing.onFrameStart();
            if (this.currentView != null) {
                this.currentView.listen(this.input);
                this.currentView.move(this.canvas);
                this.currentView.prepareDraw(this.ctx);
                this.currentView.draw(this.ctx);
                if (this.session.debug) {
                    this.currentView.drawDebug(this.ctx);
                }
                this.currentView.adjust(this);
            }
            this.timing.onFrameEnd();
            requestAnimationFrame(this.animate);
        };
        this.canvas = canvasId;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.repo = new ResourceRepository(this.initResources());
        this.initGame();
        this.views = this.initViews();
        this.startAnimation();
        this.setCurrentView(new LoadView(Object.keys(this.views)[0]));
    }
    switchViewTo(viewName) {
        const newView = this.views[viewName];
        if (!newView) {
            throw new Error(`A view with the name ${viewName} does not exist.`);
        }
        this.setCurrentView(newView);
    }
    setCurrentView(view) {
        this.currentView = view;
        console.log("Setting view to " + view);
        this.currentView.init(this);
        this.timing.onViewSwitched();
    }
    startAnimation() {
        console.log('start animation');
        requestAnimationFrame(this.animate);
    }
    static randomInteger(min, max) {
        return Math.round(Game.randomNumber(min, max));
    }
    static randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
}
class Tetris extends Game {
    initResources() {
        return new ResourceConfig([
            "background.png",
            "I.png",
            "L.png",
            "R.png",
            "S.png",
            "T.png",
        ], "./assets/images/tetris");
    }
    initGame() {
    }
    initViews() {
        return {
            'start': new StartView(),
            'level': new LevelView()
        };
    }
}
Tetris.blockSize = 44;
let game = null;
window.addEventListener('load', function () {
    game = new Tetris(document.getElementById('canvas'));
});
class LoadView extends View {
    constructor(nextView) {
        super();
        this.nextView = nextView;
    }
    listen(input) {
        super.listen(input);
    }
    adjust(game) {
        if (!game.repo.isLoading() &&
            game.timing.viewTime > LoadView.MINIMUM_FRAME_TIME) {
            game.switchViewTo(this.nextView);
        }
    }
    draw(ctx) {
        this.writeTextToCanvas(ctx, "Loading...", 80, this.center.x, this.center.y, 'center', 'black');
    }
}
LoadView.MINIMUM_FRAME_TIME = 1000;
class Input {
    constructor() {
        this.keyboard = new KeyListener();
    }
}
Input.MOUSE_NOTHING = 0;
Input.MOUSE_PRIMARY = 1;
Input.MOUSE_SECONDARY = 2;
Input.MOUSE_AUXILIARY = 4;
Input.MOUSE_FOURTH = 8;
Input.MOUSE_FIFTH = 16;
Input.KEY_ENTER = 13;
Input.KEY_SHIFT = 16;
Input.KEY_CTRL = 17;
Input.KEY_ALT = 18;
Input.KEY_ESC = 27;
Input.KEY_SPACE = 32;
Input.KEY_LEFT = 37;
Input.KEY_UP = 38;
Input.KEY_RIGHT = 39;
Input.KEY_DOWN = 40;
Input.KEY_DEL = 46;
Input.KEY_1 = 49;
Input.KEY_2 = 50;
Input.KEY_3 = 51;
Input.KEY_4 = 52;
Input.KEY_5 = 53;
Input.KEY_6 = 54;
Input.KEY_7 = 55;
Input.KEY_8 = 56;
Input.KEY_9 = 57;
Input.KEY_0 = 58;
Input.KEY_A = 65;
Input.KEY_B = 66;
Input.KEY_C = 67;
Input.KEY_D = 68;
Input.KEY_E = 69;
Input.KEY_F = 70;
Input.KEY_G = 71;
Input.KEY_H = 72;
Input.KEY_I = 73;
Input.KEY_J = 74;
Input.KEY_K = 75;
Input.KEY_L = 76;
Input.KEY_M = 77;
Input.KEY_N = 78;
Input.KEY_O = 79;
Input.KEY_P = 80;
Input.KEY_Q = 81;
Input.KEY_R = 82;
Input.KEY_S = 83;
Input.KEY_T = 84;
Input.KEY_U = 85;
Input.KEY_V = 86;
Input.KEY_W = 87;
Input.KEY_X = 88;
Input.KEY_Y = 89;
Input.KEY_Z = 90;
class KeyListener {
    constructor() {
        this.keyDown = (ev) => {
            this.keyCodeStates[ev.keyCode] = true;
        };
        this.keyUp = (ev) => {
            this.keyCodeStates[ev.keyCode] = false;
        };
        this.keyCodeStates = new Array();
        window.addEventListener("keydown", this.keyDown);
        window.addEventListener("keyup", this.keyUp);
    }
    isKeyDown(keyCode) {
        return this.keyCodeStates[keyCode] == true;
    }
}
class ResourceConfig {
    constructor(images, prefix = "") {
        this.images = images;
        this.prefix = prefix;
    }
}
class ResourceRepository {
    constructor(config) {
        this.images = {};
        this.loadingAssets = new Array();
        this.prefix = config.prefix;
        config.images.forEach((name) => {
            this.startLoadingImage(name);
        });
    }
    isLoading() {
        return this.loadingAssets.length > 0;
    }
    getImage(key) {
        return this.images[key];
    }
    startLoadingImage(name) {
        let imageElement = new Image();
        imageElement.addEventListener("load", (event) => {
            const key = this.generateKeyFromSrc(imageElement.src);
            this.images[key] = imageElement;
            this.loadingAssets.splice(this.loadingAssets.indexOf(key), 1);
        });
        const src = this.generateURL(name);
        this.loadingAssets.push(this.generateKeyFromSrc(src));
        imageElement.src = src;
    }
    generateKeyFromSrc(src) {
        const start = this.prefix.substring(1);
        const index = src.indexOf(start) + start.length + 1;
        const key = src.substr(index, src.length - index - 4).split("/").join(".");
        return key;
    }
    generateURL(name) {
        return this.prefix + "/" + name;
    }
}
class Timing {
    constructor() {
        this.gameFrames = 0;
        this.viewFrames = 0;
        this.gameStart = performance.now();
        this.gameTime = 0;
        this.viewTime = 0;
        this.frameTime = 0;
        this.frameIdleTime = 0;
        this.fps = 60;
        this.load = 0;
    }
    get frameComputeTime() {
        return this.frameTime - this.frameIdleTime;
    }
    onViewSwitched() {
        this.viewFrames = 0;
        this.viewStart = performance.now();
    }
    onFrameStart() {
        this.gameFrames++;
        this.viewFrames++;
        const now = performance.now();
        this.frameIdleTime = now - this.frameEnd;
        this.gameTime = now - this.gameStart;
        this.viewTime = now - this.viewStart;
        this.frameTime = now - this.frameStart;
        this.frameStart = now;
        this.fps = Math.round(1000 / this.frameTime);
        this.load = this.frameComputeTime / this.frameTime;
    }
    onFrameEnd() {
        this.frameEnd = performance.now();
    }
}
class Vector {
    constructor(x = 0, y = 0) {
        this._size = null;
        this._angle = null;
        this.x = x;
        this.y = y;
    }
    static fromSizeAndAngle(size, angle) {
        let x = size * Math.sin(angle);
        let y = size * Math.cos(angle);
        return new Vector(x, y);
    }
    get size() {
        if (!this._size) {
            this._size = Math.sqrt(Math.pow(this.x, 2) +
                Math.pow(this.y, 2));
        }
        return this._size;
    }
    get angle() {
        if (!this._angle) {
            this._angle = Math.atan(this.y / this.x);
        }
        return this._angle;
    }
    add(input) {
        return new Vector(this.x + input.x, this.y + input.y);
    }
    subtract(input) {
        return new Vector(this.x - input.x, this.y - input.y);
    }
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    normalize() {
        return Vector.fromSizeAndAngle(1, this.angle);
    }
    mirror_X() {
        return new Vector(this.x, this.y * -1);
    }
    mirror_Y() {
        return new Vector(this.x * -1, this.y);
    }
    distance(input) {
        return this.subtract(input).size;
    }
}
//# sourceMappingURL=app.js.map