'use strict'

let gStartPos

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

function addListeners() {
    addMouseListeners()
    addTouchListeners()
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
    gElCanvas.addEventListener('mouseout', onMouseOut)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function onDown(ev) {
    ev.preventDefault()

    const pos = getEvPos(ev)
    const meme = getMeme()

    for (let i = 0; i < meme.lines.length; i++) {
        if (isTextHit(pos.x, pos.y, i)) {
            setLineIdx(i)
            setTextDrag(true)
            setToolsToSelectedLine()
            document.body.style.cursor = 'grabbing'
        }
    }
    gStartPos = pos
}

function onMove(ev) {

    ev.preventDefault()
    const meme = getMeme()

    if (!meme.lines.length) return
    if (!getSelectedLine().text) return

    const { isDrag } = getSelectedLine()
    if (!isDrag) return

    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y

    moveText(dx, dy)
    gStartPos = pos
    renderMeme()
}

function onMouseOut() {
    const meme = getMeme()
    if (!meme.lines.length) return

    setTextDrag(false)
    document.body.style.cursor = 'default'
}

function onUp() {

    setTextDrag(false)
    document.body.style.cursor = 'grab'
}

function getEvPos(ev) {
    ev.preventDefault()

    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }

    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function setTextBorder() {
    const meme = getMeme()
    meme.lines.forEach((line, idx) => setLineDimensions(line, idx))
}

function setLineDimensions(line, lineIdx) {
    gCtx.font = `${line.size}px ${line.font}`
    let measure = gCtx.measureText(line.text)

    gMeme.lines[lineIdx].height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    gMeme.lines[lineIdx].width = measure.actualBoundingBoxLeft + measure.actualBoundingBoxRight
}

function isTextHit(x, y, index) {
    const meme = getMeme()
    let text = meme.lines[index];
    return (x >= text.pos.x && x <= text.pos.x + text.width && y >= text.pos.y - text.height && y <= text.pos.y);
}

