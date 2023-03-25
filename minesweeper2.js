
class start_game{  // 開始遊戲

    constructor(ROWS,COLS,MINES,HP) {



        this.ROWS = ROWS; // 行数
        this.COLS = COLS; // 列数
        this.MINES = MINES; // 地雷数
        this.HP= HP; // 生命值
        this.FLAGS = MINES;
        this.ROWS<this.COLS?this.TILE_SIZE = 765/this.COLS:this.TILE_SIZE = 765/this.ROWS;  // 方块大小
        // this.TILE_SIZE = 700/this.COLS

        this.width =this.ROWS*this.TILE_SIZE*this.COLS/this.ROWS;  // 生成的地图宽度
        this.height =this.COLS*this.TILE_SIZE*this.ROWS/this.COLS; // 生成的地图高度

        this.app = new PIXI.Application({ // 生成地图
            width: this.width,  // 地图宽度
            height: this.height, // 地图高度
            backgroundColor:0xffffff,  // 地图背景颜色
            backgroundAlpha: 0  // 地图背景透明度
        });
        document.body.appendChild(this.app.view); // 将地图添加到body中
        this.map=[]; // 地图
        this.tiles=[]; // 方块
        this.generalMap() // 生成地图
        this.putMine() // 随机放置地雷
        this.countMine() // 计算每个方块周围的地雷数量
        this.createTile() // 生成方块
        this.update() // 更新
    }








// 生成地图
        generalMap() { // 生成地图
            for (let i = 0; i < this.ROWS; i++) {
                this.map[i] = [];
                for (let j = 0; j < this.COLS; j++) {
                    this.map[i][j] = {
                        isMine: false, // 是否是地雷
                        isRevealed: false,  // 是否被翻开
                        isFlagged: false,  // 是否被标记
                        neighborCount: 0,  // 周围地雷数量
                    };
                }
            }
        }


// 随机放置地雷
         putMine() { // 随机放置地雷
            let placedMines = 0;  // 已放置地雷数
            while (placedMines < this.MINES) {  // 如果已放置地雷数小于地雷总数
                const row = Math.floor(Math.random() * this.ROWS);  // 随机生成行数
                const col = Math.floor(Math.random() * this.COLS);  // 随机生成列数
                if (!this.map[row][col].isMine) {  // 如果当前位置没有地雷
                    this.map[row][col].isMine = true; // 将当前位置设为地雷
                    placedMines++;  // 已放置地雷数+1
                }
            }
        }

// 计算每个方块周围的地雷数量
         countMine() {  // 计算每个方块周围的地雷数量
            for (let i = 0; i < this.ROWS; i++) {  // 遍历地图
                for (let j = 0; j < this.COLS; j++) {  // 遍历地图
                    let count = 0; // 周围地雷数
                    for (let x = i - 1; x <= i + 1; x++) {  // 遍历当前方块周围的方块
                        for (let y = j - 1; y <= j + 1; y++) {  // 遍历当前方块周围的方块
                            // 如果当前方块不是地雷，则计数
                            if (
                                x >= 0 &&  //排除邊界
                                x < this.ROWS &&
                                y >= 0 &&
                                y < this.COLS &&
                                this.map[x][y].isMine  // 如果当前方块是地雷
                            ) {
                                count++;  // 周围地雷数+1
                            }
                        }
                    }
                    this.map[i][j].neighborCount = count;  // 将周围地雷数赋值给当前方块
                }
            }
        }

// 生成方块
         createTile() {

            const container = new PIXI.Container(); // 生成容器

            for (let i = 0; i < this.ROWS; i++) {  // 遍历地图
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
                            if (!this.map[i][j].isRevealed) { // 如果当前方块没有被翻开
                                if (this.map[i][j].isMine) { // 如果当前方块是地雷
                                    if (this.HP > 1) {
                                        this.HP--;
                                        this.flagTile(i, j);
                                        return;
                                    }
                                    else {
                                        this.gameOver();
                                    }
                                } else {
                                    this.revealTile(i, j);
                                    this.checkGameEnd();
                                }
                            }
                        }
                        this.update();
                    });
                    //如果用戶點擊右鍵
                    tile.on("pointerdown", (e) => {
                        e.preventDefault();
                        if (e.data.button === 2) {

                            this.flagTile(i, j);
                        }
                        this.update();
                    });


                    container.addChild(tile);
                    this.tiles.push(tile); // 将方块添加到数组中
                }
            }
             this.app.stage.addChild(container);

        }


//點擊發生時 left-click
         revealTile(row, col) {
            const data = this.map[row][col];
            if (data.isFlagged) {  // 如果已被標記
                return;  // 返回
            }


            data.isRevealed = true;  // 將該方塊設為已翻開
            const tile = this.tiles[row * this.COLS + col];  // 獲取該方塊
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
            console.log(this.FLAGS)
            const data = this.map[row][col];
            if (data.isRevealed) { // 如果已翻開
                return;
            }
            if (this.FLAGS === 0 && !data.isFlagged) {  // 如果標記數為0且未被標記
                this.gameOver();  // 遊戲結束
            }

            data.isFlagged = !data.isFlagged;　// 將該方塊設為已標記或未標記
            if (data.isFlagged) { // 如果已被標記
                const flag = new PIXI.Sprite(PIXI.Texture.from("assets/img/flag.png"));
                flag.width = this.TILE_SIZE * 0.6;
                flag.height = this.TILE_SIZE * 0.6;
                flag.x = col * this.TILE_SIZE + this.TILE_SIZE / 2 - flag.width / 2;
                flag.y = row * this.TILE_SIZE + this.TILE_SIZE / 2 - flag.height / 2;
                this.app.stage.addChild(flag);
                this.tiles[row * this.COLS + col].isFlagged = true;　// 將該方塊設為已標記
                this.FLAGS--;　// 標記數-1
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
                this.FLAGS++;
            }
        }

// 判断游戏是否结束
         checkGameEnd() {
            let revealedCount = 0;　　// 已翻開方塊數
            let flaggedCount = 0;　　// 已標記方塊數
            let explodedMine = false;　　// 是否踩到地雷
            for (let i = 0; i < this.ROWS; i++) {
                for (let j = 0; j < this.COLS; j++) {
                    const data = this.map[i][j];
                    if (data.isRevealed) {
                        revealedCount++;
                    }
                    if (data.isFlagged) {
                        flaggedCount++;
                    }
                    if (data.isRevealed && data.isMine) { // 如果已翻開且是地雷
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
             for (let i = 0; i < this.ROWS; i++) {
                 for (let j = 0; j < this.COLS; j++) {
                     if (this.map[i][j].isMine) { // 如果当前方块是地雷
                         this.flagTile(i, j);
                     } else {
                         this.revealTile(i, j);

                     }
                 }
             }
            alert("Game Over");
        }

// 游戏胜利
         gameWin() {

            alert("You Win");
        }

        update() {
            parent.document.getElementById("HPVIEW").textContent = "HP:"+this.HP;
            // parent.document.getElementById("MINEVIEW").textContent = this.MINES;
            //  parent.document.getElementById("TIMEVIEW").textContent = this.TIME;
            parent.document.getElementById("FLAGSVIEW").textContent ="FLAGS:"+ this.FLAGS;
        }






}
try {
    game = new start_game(parent.document.querySelector('#rows').value, parent.document.querySelector('#cols').value, parent.document.querySelector('#mine').value,parent.document.querySelector('#hp').value)
}catch (e) {
    game = new start_game(10, 10, 10,3)
}
document.oncontextmenu = function(e){
    return false;
}

