'use strict'
const FLAG = '🚩'
const MINE = '<img src="img/mine.png" alt="">'

var gLives = 3
var gBoard = []
var gStartTime = null
var gInterval = 0
//Local Storage:
var gUserFound = false
var gNumOfPlayers = localStorage.length + 1
var gCurrUserName = 'Guest'

var gLevel = {
    SIZE: 8,
    MINES: 14
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    updateBestScore()
    resetLives()
    gGame.isOn = true
    displayModal(false)
}

// Render a <table> board to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) //exmp: 'cell-3-4'
            strHTML += `\t<td class="cell ${cellClass}" 
                onclick="onCellClicked(this,${i},${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;">`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board-container')
    elBoard.innerHTML = strHTML
}

// Builds the board   Set the mines Call setMinesNegsCount() Return the created board
function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

// Count mines around each cell and set the cell's minesAroundCount. 
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            checkForNegsMines(board, i, j)
        }
    }
}

function checkForNegsMines(board, cellI, cellJ) {
    if (board[cellI][cellJ].isMine) return
    var minesAmount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === cellI && j === cellJ) continue
            if (board[i][j].isMine) {
                minesAmount++
            }
        }
    }
    board[cellI][cellJ].minesAroundCount = minesAmount
}

// RIGHT Click
function onCellMarked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isShown || elCell.innerHTML === MINE) return
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.innerText = ''
    } else {
        gBoard[i][j].isMarked = true
        elCell.innerText = FLAG
        checkGameOver()
    }

}
// LEFT Click >> if not flaged reveals number or clean spots + clean negs. OR >> found mmine and end
function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return //if game off (lose / win) unable moves


    if (!checkShown()) { // for first click:
        getRandomMines(gLevel.MINES, gBoard, { i: i, j: j })
        setMinesNegsCount(gBoard)
        gStartTime = Date.now()
        gInterval = setInterval(updateGameTime, 85)
    }

    if (gBoard[i][j].isMarked) return //if Flaged cant reveal
    var currCellIdx = { i: i, j: j }

    if (gBoard[i][j].isMine) { // MINE Found
        if (elCell.innerHTML === MINE) return
        gLives--
        if (gLives === 0) {
            var elResetBtn = document.querySelector('.reset-btn')
            elResetBtn.innerHTML = '<img src="img/lose.gif" alt="">'
            gGame.isOn = false
            revealAllMines(getMines())
            clearInterval(gInterval)
            return
        } else {
            var elLives = document.querySelector('.lives span')
            elLives.innerText = gLives
            renderCell(currCellIdx, MINE)  // reveal Mine
            gBoard[i][j].isMine = true
            checkGameOver()
            return
        }
    }
    if (gBoard[i][j].minesAroundCount) {// Spot with number
        renderCell(currCellIdx, gBoard[i][j].minesAroundCount)
    } else { // reveals clean spot + reveals all around
        expandShown(i, j)
        elCell.innerHTML = ''
    }
    // anyway reveals current cell (if found mine ending game)
    elCell.classList.add('shown')
    gBoard[i][j].isShown = true
    checkGameOver()
}

function expandShown(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE || (i === row && j === col)) continue
            var elNegCell = document.querySelector(`.cell-${i}-${j}`)
            if (!gBoard[i][j].isShown && !gBoard[i][j].minesAroundCount) { // if currCell =NOT shown + NOT num = reveal SPOT
                if (gBoard[i][j].isMine) continue
                elNegCell.classList.add('shown')
                gBoard[i][j].isShown = true
                gBoard[i][j].minesAroundCount = ''
                expandShown(i, j)
            }
            if (gBoard[i][j].minesAroundCount > 0){
                var currCellIdx ={i, j}
                renderCell(currCellIdx, gBoard[i][j].minesAroundCount)
                gBoard[i][j].isShown = true
                elNegCell.classList.add('shown')
            }
        }
    }
}

function checkGameOver() {
    var countMines = 0
    var countShown = 0
    var countFlags = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMarked) countFlags++
            if (gBoard[i][j].isShown) countShown++
            var elCell = document.querySelector(`.cell-${i}-${j}`) //for visible mines
            if (elCell.innerHTML === MINE) countMines++
        }
    }
    // console.log(countShown, '=?', gLevel.SIZE ** 2 - gLevel.MINES)
    if (countFlags === gLevel.MINES - countMines) { // The exact amount of flags to win
        if (countShown === gLevel.SIZE ** 2 - gLevel.MINES) win()
    }
}

function getRandomMines(maxMines, board, mineFreeIdx) { // sets mines by gLevel SIZE/MINES
    while (maxMines > 0) { // runs until got the number of mine requested
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (mineFreeIdx.i !== i && mineFreeIdx.j !== j && !board[i][j].isMine) {
                    if (maxMines > 0 && Math.random() < gLevel.MINES / gLevel.SIZE ** 2) {
                        maxMines--
                        board[i][j].isMine = true
                    }
                }
            }
        }
    }
}

function win() {
    var elWinMsg = document.querySelector('.win-msg')
    var finishTime = (Date.now() - gStartTime) / 1000
    elWinMsg.innerText = `you have finish the game in: ${parseInt(finishTime)}s!`
    getWinTime() // if its new best score >> update score
    displayModal(true)
    clearInterval(gInterval)
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerHTML = '<img src="img/win.jpg" alt="">'
}

function resetGame() {
    displayModal(false)
    clearInterval(gInterval)
    resetTime()
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerHTML = '<img src="img/happy.jpg" alt="">'
    gGame.isOn = true
    if (gLives > 0) {  // If didnt lose all lives
        gBoard = buildBoard()
        renderBoard(gBoard)
    } else {
        gBoard = buildBoard()
        renderBoard(gBoard)
        gLives = 3
    }
}

// This functions return all mines with obj - {i: i, j: j}
function getMines() {
    var mines = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                mines.push({ i, j })
            }
        }
    }
    if (mines.length === 0) return null
    return mines
}

function revealAllMines(minesIdx) {
    var currCell = {}
    for (var i = 0; i < minesIdx.length; i++) {
        currCell = minesIdx[i]
        renderCell(currCell, MINE)
    }
}

function resetHTML() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerText = ''
                if (elCell.classList.contains('shown')) elCell.classList.remove('shown')
            }
        }
    }
}

function checkShown() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown) {
                return true
            }
        }
    }
    return false
}

function selectMode(elBtn) { //reset the board to the mode request 
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerHTML = '<img src="img/happy.jpg" alt="">'
    clearInterval(gInterval)
    resetTime()
    displayModal(false)
    switch (elBtn.innerText) {
        case 'Beginner(16)':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            onInit()
            break
        case 'Medium(64)':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            onInit()
            break
        case 'Expert!(144)':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            onInit()
            break
        default:
            break
    }
}

function updateGameTime() {
    var currTime = (Date.now() - gStartTime) / 1000
    var gameTime = document.querySelector('.game-time span')
    gameTime.innerText = (parseInt(currTime) + 's')
}

// This function reset display time to 0
function resetTime() {
    var gameTime = document.querySelector('.game-time span')
    gameTime.innerText = 0 + 's'
}

// This function display Modal when winning a game
// By the var isDisplay - toggles show and hidden
function displayModal(isDisplay) {
    var elModal = document.querySelector('.modal')
    if (isDisplay) elModal.classList.remove('hidden')
    else elModal.classList.add('hidden')
}

// This function define the current player name.
// If user found in storage - use it, if not create new player to storage.
function changeUserName() {
    gUserFound = false
    var nickName = prompt('Please Insert your nick name:')
    for (var i = 0; i < gNumOfPlayers + 1; i++) {
        if (localStorage.getItem('nickName:' + [i + 1]) === nickName) {
            alert(nickName + ' Welcome Back!')
            gUserFound = true
            break
        }
    }
    if (!gUserFound) {
        if (!nickName) nickName = 'Guest ' + gNumOfPlayers
        localStorage.setItem('nickName:' + gNumOfPlayers, nickName)
        alert('Welcome to Mine Sweeper game: ' + nickName)
        gNumOfPlayers = i
    }
    var elNickName = document.querySelector('.user-name span')
    elNickName.innerText = nickName
    gCurrUserName = nickName
}

// This function return win time. If best score, updates storage and game
function getWinTime() {
    var lvlStr = getGameLevel()
    var bestTime = localStorage.getItem(`Best-Time: ${lvlStr.lvlStr}`)
    var winTime = (Date.now() - gStartTime) / 1000
    if (!bestTime || winTime < bestTime) {
        localStorage.setItem(`Best-Time: ${lvlStr.lvlStr}`, `${winTime}`)
        localStorage.setItem(`Best-player: ${lvlStr.lvlStr}`, `${gCurrUserName}`)
        var elBestScore = document.querySelector('.best-score span')
        elBestScore.innerText = winTime.toFixed(1) + 's'
    }
    return winTime
}

// This function update the best score based on the current lvl
function updateBestScore() {
    var lvlStr = getGameLevel()
    var bestScore = parseFloat(localStorage.getItem(`Best-Time: ${lvlStr.lvlStr}`))
    var elBestScore = document.querySelector('.best-score span')
    if (!bestScore) elBestScore.innerText = 'None'
    else elBestScore.innerText = bestScore.toFixed(1) + 's'
}

// This function return obj with: {lvl (str), & max live (num)}
function getGameLevel() {
    var lvlStr = ''
    var maxLives = 0
    switch (gLevel.SIZE) {
        case 4:
            lvlStr = 'Beg'
            maxLives = 2
            break
        case 8:
            lvlStr = 'Med'
            maxLives = 2
            break
        case 12:
            lvlStr = 'Exp'
            maxLives = 3
            break
        default:
            break
    }
    return { lvlStr, maxLives }
}

// This function reset lives according to the current lvl
// also return number of max lives
function resetLives() {
    var elLives = document.querySelector('.lives span')
    switch (gLevel.SIZE) {
        case 4:
            gLives = 2
            elLives.innerText = 2
            break
        case 8:
            gLives = 2
            elLives.innerText = 2
            break
        case 12:
            gLives = 3
            elLives.innerText = 3
            break
        default:
            break
    }
}

function darkModeToggle() {
    var elBody = document.querySelector('body')
    var elDarkMode = document.querySelector('.dark-mode span')
    if (elBody.style.backgroundColor === 'black') {
        elBody.style.backgroundColor = 'white'
        elDarkMode.innerText = 'Dark Mode'
    } else {
        elBody.style.backgroundColor = 'black'
        elDarkMode.innerText = 'Light Mode'
    }
}

function bestScoreDisplay(){                           // Edit later!!!
    var begName = localStorage.getItem('Best-player: Beg')
    var begScore = localStorage.getItem('Best-Time: Beg')
    var medName = localStorage.getItem('Best-player: Med')
    var medScore = localStorage.getItem('Best-Time: Med')
    var expName = localStorage.getItem('Best-player: Exp')
    var exptScore = localStorage.getItem('Best-Time: Exp')
    var scoreArray = [begName, begScore, medName, medScore, expName, exptScore]
    for (var i = 0; i < scoreArray.length; i++){
        if (!scoreArray[i]) scoreArray[i] = 'None'
        // console.log(111)
    }
    alert(`Score-Board:
    Best-player: Beginner - ${begName}
    Best-Score: Beginner - ${begScore}
    Best-player: Medium - ${medName}
    Best-Score: Medium - ${medScore}
    Best-player: Expert - ${expName}
    Best-Score: Expert - ${exptScore}
    `)
}