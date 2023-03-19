
class start_game{

    constructor(ROWS,COLS,MINES) {



        this.ROWS = ROWS;
        this.COLS = COLS;
        this.MINES = MINES;
        this.ROWS<this.COLS?this.TILE_SIZE = 700/this.COLS:this.TILE_SIZE = 700/this.ROWS;
        // this.TILE_SIZE = 700/this.COLS

        this.width =this.ROWS*this.TILE_SIZE*this.COLS/this.ROWS;
        this.height =this.COLS*this.TILE_SIZE*this.ROWS/this.COLS;

        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            backgroundColor:0xffffff,
            backgroundAlpha: 0
        });
        document.body.appendChild(this.app.view);
        this.map=[];
        this.tiles=[];
        this.generalMap()
        this.putMine()
        this.countMine()
        this.createTile()
    }








// 生成地图
        generalMap() {
            for (let i = 0; i < this.ROWS; i++) {
                this.map[i] = [];
                for (let j = 0; j < this.COLS; j++) {
                    this.map[i][j] = {
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborCount: 0,
                    };
                }
            }
        }


// 随机放置地雷
         putMine() {
            let placedMines = 0;
            while (placedMines < this.MINES) {
                const row = Math.floor(Math.random() * this.ROWS);
                const col = Math.floor(Math.random() * this.COLS);
                // 如果当前位置没有地雷，则放置地雷
                if (!this.map[row][col].isMine) {
                    this.map[row][col].isMine = true;
                    placedMines++;
                }
            }
        }

// 计算每个方块周围的地雷数量
         countMine() {
            for (let i = 0; i < this.ROWS; i++) {
                for (let j = 0; j < this.COLS; j++) {
                    // 如果当前方块是地雷，则跳过
                    let count = 0;
                    for (let x = i - 1; x <= i + 1; x++) {
                        for (let y = j - 1; y <= j + 1; y++) {
                            // 如果当前方块不是地雷，则计数
                            if (
                                x >= 0 &&
                                x < this.ROWS &&
                                y >= 0 &&
                                y < this.COLS &&
                                this.map[x][y].isMine
                            ) {
                                count++;
                            }
                        }
                    }
                    this.map[i][j].neighborCount = count;
                }
            }
        }

// 生成方块
         createTile() {

            const container = new PIXI.Container();
// container.x=app.screen.width/2-container.width/2;
// container.y=app.screen.height/2-container.height/2;
            for (let i = 0; i < this.ROWS; i++) {
                for (let j = 0; j < this.COLS; j++) {
                    const tile = new PIXI.Sprite(
                        PIXI.Texture.from("assets/img/tile.jpg")
                    );
                    tile.width = this.TILE_SIZE;
                    tile.height = this.TILE_SIZE;
                    tile.x = j * this.TILE_SIZE;
                    tile.y = i * this.TILE_SIZE;
                    tile.interactive = true;
                    //如果用戶點擊左鍵
                    tile.on("pointerdown", (e) => {
                        if (e.data.button === 0) {
                            if (!this.map[i][j].isRevealed) {
                                if (this.map[i][j].isMine) {
                                    this.gameOver();
                                } else {
                                    this.revealTile(i, j);
                                    this.checkGameEnd();
                                }
                            }
                        }
                    });
                    //如果用戶點擊右鍵
                    tile.on("pointerdown", (e) => {
                        e.preventDefault();
                        if (e.data.button === 2) {

                            this.flagTile(i, j);
                        }
                    });


                    container.addChild(tile);
                    this.tiles.push(tile);
                }
            }
             this.app.stage.addChild(container);
        }

//點擊發生時
         revealTile(row, col) {
            const data = this.map[row][col];
            if (data.isFlagged) {
                return;
            }
            data.isRevealed = true;
            const tile = this.tiles[row * this.COLS + col];
            if (data.isMine) {
                tile.texture = PIXI.Texture.from("mine.png");
            } else if (data.neighborCount > 0
            ){
                tile.texture = PIXI.Texture.from(`assets/img/${data.neighborCount}.png`);
            } else {
                tile.texture = PIXI.Texture.from("assets/img/empty.png");
                for (let x = row - 1; x <= row + 1; x++) {
                    for (let y = col - 1; y <= col + 1; y++) {
                        if (
                            x >= 0 &&
                            x < this.ROWS &&
                            y >= 0 &&
                            y < this.COLS &&
                            !this.map[x][y].isMine &&
                            !this.map[x][y].isRevealed
                        ) {
                            this.revealTile(x, y);
                        }
                    }
                }
            }
        }

// 标记方块为地雷或取消标记
         flagTile(row, col) {

            const data = this.map[row][col];
            if (data.isRevealed) {
                return;
            }
            data.isFlagged = !data.isFlagged;
            if (data.isFlagged) {
                const flag = new PIXI.Sprite(PIXI.Texture.from("assets/img/flag.png"));
                flag.width = this.TILE_SIZE * 0.6;
                flag.height = this.TILE_SIZE * 0.6;
                flag.x = col * this.TILE_SIZE + this.TILE_SIZE / 2 - flag.width / 2;
                flag.y = row * this.TILE_SIZE + this.TILE_SIZE / 2 - flag.height / 2;
                this.app.stage.addChild(flag);
                this.tiles[row * this.COLS + col].isFlagged = true;
            } else {
                this.app.stage.children.forEach((child) => {
                    if (
                        child instanceof PIXI.Sprite &&
                        child.texture === PIXI.Texture.from("assets/img/flag.png") &&
                        child.x === col * this.TILE_SIZE + this.TILE_SIZE / 2 - this.TILE_SIZE * 0.3 &&
                        child.y === row * this.TILE_SIZE + this.TILE_SIZE / 2 - this.TILE_SIZE * 0.3
                    ) {
                        this.app.stage.removeChild(child);
                    }
                });
                this.tiles[row * this.COLS + col].isFlagged = false;
            }
        }

// 判断游戏是否结束
         checkGameEnd() {
            let revealedCount = 0;
            let flaggedCount = 0;
            let explodedMine = false;
            for (let i = 0; i < this.ROWS; i++) {
                for (let j = 0; j < this.COLS; j++) {
                    const data = this.map[i][j];
                    if (data.isRevealed) {
                        revealedCount++;
                    }
                    if (data.isFlagged) {
                        flaggedCount++;
                    }
                    if (data.isRevealed && data.isMine) {
                        explodedMine = true;
                    }
                }
            }
            if (explodedMine) {
                this.gameOver();
            } else if (revealedCount === this.ROWS * this.COLS - this.MINES || flaggedCount === this.MINES) {
                this.gameWin();
            }
        }

// 游戏失败
         gameOver() {
            alert("Game Over");
        }

// 游戏胜利
         gameWin() {
            alert("You Win");
        }








}
try {
    let message = document.getElementById('colsj');

    game = new start_game(parent.document.querySelector('#rows').value, parent.document.querySelector('#cols').value, parent.document.querySelector('#mine').value)
}catch (e) {
    game = new start_game(10, 10, 10)
}
document.oncontextmenu = function(e){
    return false;
}

