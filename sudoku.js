const cells = document.getElementsByClassName('number');
const nums = document.getElementsByClassName('choice');
const del = document.getElementsByClassName('delete')[0];
const solve = document.getElementsByClassName('solve')[0];
const clear = document.getElementsByClassName('clear')[0];
const lvl = document.getElementsByClassName('level')[0];
const restart = document.getElementsByClassName('restart')[0];
const statusBar = document.getElementsByClassName('status')[0];

let grid=Array(9).fill().map(()=>Array(9));
let state=Array(9).fill().map(()=>Array(9));
let cnt=0;
let selectedCell=null;
let level=1;

let board = Array(9).fill().map(()=>Array(9).fill(0));

function getRandom(){
    return Math.floor(Math.random()*9);
}

function checkRow(i,c){
    for(let j=0;j<9;j++){
        if(j!=c&&board[i][j]&&board[i][c]==board[i][j]){
            return false;
        }
    }
    return true;
}

function checkCol(r,j){
    for(let i=0;i<9;i++){
        if(i!=r&&board[i][j]&&board[r][j]==board[i][j]){
            return false;
        }
    }
    return true;
}

function checkSub(r,c){
    for(let i=Math.floor(r/3)*3;i<Math.floor(r/3)*3+3;i++){
        for(let j=Math.floor(c/3)*3;j<Math.floor(c/3)*3+3;j++){
            if(i!=r&&j!=c&&board[i][j]&&board[r][c]==board[i][j]){
                return false;
            }
        }
    }
    return true;
}

function valid(r,c){
    return checkRow(r,c)&&checkCol(r,c)&&checkSub(r,c);
}

function canPlace(r,c,val){
    for(let i=0;i<9;i++){
        if(board[i][c]==val)return false;
        if(board[r][i]==val)return false;
    }
    for(let i=Math.floor(r/3)*3;i<Math.floor(r/3)*3+3;i++){
        for(let j=Math.floor(c/3)*3;j<Math.floor(c/3)*3+3;j++){
            if(board[i][j]==val)return false;
        }
    }
    return true;
}

function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        let rand=Math.floor(Math.random()*(i+1));
        [arr[i],arr[rand]]=[arr[rand],arr[i]];
    }
}

let base = [1,2,3,4,5,6,7,8,9];

function fillBox(s,e){
    shuffle(base);
    let k=0;
    for(let i=s;i<e;i++){
        for(let j=s;j<e;j++){
            board[i][j]=base[k++];
        }
    }
}

function backtrack(i,j){
    if(i==9)return true;
    if(j==9)return backtrack(i+1,0);
    if(board[i][j])return backtrack(i,j+1);
    for(let k=1;k<=9;k++){
        if(canPlace(i,j,k)){
            board[i][j]=k;
            if(backtrack(i,j+1))return true;
            board[i][j]=0;
        }
    }
    return false;
}

function removeNonClues(level){
    let count=34+5*level;
    while(count>0){
        let r=Math.floor(Math.random()*9);
        let c=Math.floor(Math.random()*9);
        board[r][c]=0;
        count--;
    }
}

function generateFullBoard(level){
    board = Array(9).fill().map(()=>Array(9).fill(0));
    for(let i=0;i<9;i+=3)fillBox(i,i+3);
    backtrack(0,0);
    removeNonClues(level);
}

for(let tr=0;tr<3;tr++){
    for(let tc=0;tc<3;tc++){
        for(let or=0;or<3;or++){
            for(let oc=0;oc<3;oc++){
                let r=or+tr*3;
                let c=oc+tc*3;
                grid[r][c]=cells[cnt++];
                state[r][c]=0;
            }
        }
    }
}

function removeClass(i,j){
    grid[i][j].classList.remove('fixed-invalid');
    grid[i][j].classList.remove('invalid');
    grid[i][j].classList.remove('fixed');
}

function update(init){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            grid[i][j].textContent=board[i][j]?board[i][j]:" ";
            removeClass(i,j);
            if(init)state[i][j]=0;
        }
    }
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(init)state[i][j]=board[i][j]?1:0;
            if(!valid(i,j))state[i][j]|=2;
            else if(state[i][j]&2)state[i][j]-=2;
            if(selectedCell&&selectedCell[0]==i&&selectedCell[1]==j)continue;
            if(state[i][j]==3)grid[i][j].classList.add('fixed-invalid');
            else if(state[i][j]==2)grid[i][j].classList.add('invalid');
            else if(state[i][j]==1)grid[i][j].classList.add('fixed');
        }
    }
    let invalid=false,incomplete=false,count=0;
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(state[i][j]&2)invalid=true;
            if(board[i][j]==0){
                incomplete=true;
                count++;
            }
        }
    }
    if(invalid){
        statusBar.style.backgroundColor='#FF355A';
        statusBar.textContent="Invalid Placements";
    }
    else if(!incomplete){
        statusBar.style.backgroundColor='#00D346';
        statusBar.textContent="The Board is Complete";
    }
    else{
        statusBar.style.backgroundColor='#FF7F00';
        statusBar.textContent=String(count)+" cells still empty";
    }
}

function selectRow(i,c){
    for(let j=0;j<9;j++){
        if(j!=c)grid[i][j].classList.add('selected-hint');
    }
}

function selectCol(r,j){
    for(let i=0;i<9;i++){
        if(i!=r)grid[i][j].classList.add('selected-hint');
    }
}

function selectSub(r,c){
    for(let i=Math.floor(r/3)*3;i<Math.floor(r/3)*3+3;i++){
        for(let j=Math.floor(c/3)*3;j<Math.floor(c/3)*3+3;j++){
            if(i!=r&&j!=c)grid[i][j].classList.add('selected-hint');
        }
    }
}

function selectHint(i,j){
    selectRow(i,j);
    selectCol(i,j);
    selectSub(i,j);
}

function clearSelect(){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            grid[i][j].classList.remove('selected');
            grid[i][j].classList.remove('selected-hint');
        }
    }
}

function selectCell(i,j){
    selectedCell=[i,j];
    grid[i][j].classList.add('selected');
}

function deselect(){
    clearSelect();
    selectedCell=null;
}

function select(i,j){
    deselect();
    selectCell(i,j);
    selectHint(i,j);
    update(0);
}


function removeSelected(){
    if(selectedCell==null)return;
    let [x,y]=selectedCell;
    board[x][y]=0;
    update(0);
}

function inside(i,j){
    return i>=0&&j>=0&&i<9&&j<9;
}

function selectNext(dx,dy){
    if(selectedCell==null)return;
    let [x,y]=selectedCell;
    x+=dx;
    y+=dy;
    while(inside(x,y)&&(state[x][y]&1)){
        x+=dx;
        y+=dy;
    }
    if(inside(x,y)&&(state[x][y]&1)==0)select(x,y);
}

function placeNumber(digit){
    nums[digit-1].classList.remove('choice-click');
    nums[digit-1].offsetWidth;
    nums[digit-1].classList.add('choice-click');
    let [x,y]=selectedCell;
    board[x][y]=digit;
    update(0);
}

function initCells(){
    update(1);
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            grid[i][j].addEventListener('click',()=>{
                if(!(state[i][j]&1))select(i,j);
            });
        }
    }
    for(let i=0;i<9;i++){
        nums[i].addEventListener('click',()=>{
            if(selectedCell!=null){
                placeNumber(Number(nums[i].textContent));
            }
        });
    }
    del.addEventListener('click',()=>{
        if(selectedCell!=null){
            removeSelected();
        }
    });
}

function initialize(){
    deselect();
    generateFullBoard(level);
    initCells();
}

initialize();

window.addEventListener("keydown",e=>{
    if(selectedCell!=null){
        let press=e.key;
        if(press.length==1){
            let digit=Number(press[0]);
            if(digit>0&&digit<10)placeNumber(digit);
        }
        else{
            if(press==="Backspace"||press==="Delete")removeSelected();
            else if(press==="ArrowLeft")selectNext(0,-1);
            else if(press==="ArrowRight")selectNext(0,1);
            else if(press==="ArrowUp")selectNext(-1,0);
            else if(press==="ArrowDown")selectNext(1,0);
        }
    }
});

function cleanBoard(){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(state[i][j]&1)continue;
            board[i][j]=0;
        }
    }
    update(1);
}

clear.addEventListener('click',()=>{
    cleanBoard();
});

restart.addEventListener('click',()=>{
    initialize();
});

lvl.addEventListener('click',()=>{
    level=level%10+1;
    lvl.textContent="Level "+String(level);
});

function sudokuSolver(){
    cleanBoard();
    backtrack(0,0);
    update(0);
    clearSelect();
}

solve.addEventListener('click',()=>{
    sudokuSolver();
});