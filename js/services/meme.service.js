'use strict'

const gStickerShow = 5
let gPageIdx = 1

let gImgs = [
    { id: 1, url: 'meme-imgs/1.jpg', keywords: ['woman'] },
    { id: 2, url: 'meme-imgs/2.jpg', keywords: ['funny'] },
    { id: 3, url: 'meme-imgs/3.jpg', keywords: ['animal'] },
    { id: 4, url: 'meme-imgs/4.jpg', keywords: ['funny'] },
    { id: 5, url: 'meme-imgs/5.jpg', keywords: ['men', 'animal'] },
    { id: 6, url: 'meme-imgs/6.jpg', keywords: ['animal'] },
    { id: 7, url: 'meme-imgs/7.jpg', keywords: ['men'] },
    { id: 8, url: 'meme-imgs/8.jpg', keywords: ['funny', 'men'] },
    { id: 9, url: 'meme-imgs/9.jpg', keywords: ['men'] },
    { id: 10, url: 'meme-imgs/10.jpg', keywords: ['men'] },
    { id: 11, url: 'meme-imgs/11.jpg', keywords: ['men'] },
    { id: 12, url: 'meme-imgs/12.jpg', keywords: ['funny', 'men'] },
    { id: 13, url: 'meme-imgs/13.jpg', keywords: ['funny', 'men'] },
    { id: 14, url: 'meme-imgs/14.jpg', keywords: ['funny', 'men'] },
    { id: 15, url: 'meme-imgs/15.jpg', keywords: ['funny', 'men'] },
    { id: 16, url: 'meme-imgs/16.jpg', keywords: ['animal'] },
    { id: 17, url: 'meme-imgs/17.jpg', keywords: ['funny', 'men'] },
    { id: 18, url: 'meme-imgs/18.jpg', keywords: ['funny', 'men'] },
    { id: 19, url: 'meme-imgs/19.jpg', keywords: ['men'] },
    { id: 20, url: 'meme-imgs/20.jpg', keywords: ['men'] },
    { id: 21, url: 'meme-imgs/21.jpg', keywords: ['funny', 'men'] },
    { id: 22, url: 'meme-imgs/22.jpg', keywords: ['funny', 'woman'] },
    { id: 23, url: 'meme-imgs/23.jpg', keywords: ['funny', 'men'] },
    { id: 24, url: 'meme-imgs/24.jpg', keywords: ['men'] },
    { id: 25, url: 'meme-imgs/25.jpg', keywords: ['funny'] },
]

let stickers = ['❤', '😁', '💥', '😍', '😁', '😂', '😎', '😜', '✈', '🎥']

let gKeywordSearchCountMap = { 'funny': 0, 'men': 0, 'woman': 0, 'animal': 0 }

let gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    memeId: 0,
    lines: [],
    thumbnail: '',
    uploadedImg: '',
}

function getMeme() {
    return gMeme
}

function getImages() {
    return gImgs
}

function getStickers() {
    const startIdx = (gPageIdx - 1) * gStickerShow
    return stickers.slice(startIdx, startIdx + gStickerShow)
}

function getPages() {
    return stickers.length / gStickerShow
}

function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx]
}

function getGPageIdx() {
    return gPageIdx
}

function getLines() {
    return gMeme.lines
}

function getKeyWordSearchMap() {
    return gKeywordSearchCountMap
}

function setGMeme(meme) {
    gMeme = meme
}

function setPageIdx(value) {
    gPageIdx = value
}

function setImgId(imgId) {
    gMeme.selectedImgId = imgId
}

function setNewImg(id, url) {
    gImgs.push({ id, url, keywords: [''] })
}

function setGImgs() {
    const imgs = loadFromStorage('imgs') || gImgs
    gImgs = imgs
}

function setMemeId(id) {
    gMeme.memeId = id
}

function setUploadImg(imgUrl) {
    gMeme.uploadedImg = imgUrl
}

function setTextDrag(boolean) {
    getSelectedLine().isDrag = boolean
}

function setKeyWordSearch(key) {
    gKeywordSearchCountMap[key]++
}

function setKeyWordSearchMap() {
    gKeywordSearchCountMap = loadFromStorage('key-word') || gKeywordSearchCountMap
}

function setLineIdx(idx) {
    gMeme.selectedLineIdx = idx
}

function setLineText(value) {
    getSelectedLine().text = value
}

function setSticker() {
    const selectedLine = getSelectedLine()
    selectedLine.isSticker = true
    selectedLine.size = 35
}

function moveText(dx, dy) {
    getSelectedLine().pos.x += dx
    getSelectedLine().pos.y += dy
}

function findImgById(id) {
    return gImgs.find(img => img.id === id)
}

function createLine(text = '', x, y) {
    return {
        pos: { x, y },
        text,
        size: 20,
        color: 'black',
        isDrag: false,
        font: 'Impact',
        strokeColor: 'black',
        isStroke: false,
        isSticker: false,
    }
}

function addLine(text, x = 50, y = 100) {
    gMeme.selectedLineIdx = gMeme.lines.length - 1 + 1
    gMeme.lines.push(createLine(text, x, y))
}

function clearGMeme() {
    gMeme = {
        selectedImgId: 0,
        selectedLineIdx: 0,
        memeId: 0,
        lines: [],
        thumbnail: '',
        uploadedImg: '',
    }
}

function deleteLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
}

function changeFontSize(value) {
    const selectedLine = getSelectedLine()
    const minusPlus = {
        '+': +1,
        '-': -1
    }
    const newRating = selectedLine.size + minusPlus[value]
    if (newRating < 0) return

    selectedLine.size = newRating
}

function changeFontFamily(font) {
    getSelectedLine().font = font
}

function changeColor(value, type) {
    getSelectedLine()[type] = value
}

function setTextStroke(boolean) {
    getSelectedLine().isStroke = boolean
}

