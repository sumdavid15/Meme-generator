'use strict'

let gElCanvas;
let gCtx;
let gElImg;
let gMemeId;
let searchText;

function onInit() {
    searchText = ''

    setGMemeId()
    setKeyWordSearchMap()
    setGImgs()
    renderFavoriteFontSize()
    renderMemeImages()
    renderStickers()
    createCanvas()
    addListeners()
}

function renderMeme() {
    const meme = getMeme()
    if (!gElImg) {
        const img = findImgById(meme.selectedImgId)
        drawImg3(img.url, meme)
    } else {
        coverCanvasWithImg(gElImg)
        drawText(meme.lines)
        renderStroke()
    }
}

function drawImg3(imgUrl, meme) {
    gElImg = new Image()
    gElImg.src = imgUrl
    gElImg.onload = () => {
        coverCanvasWithImg(gElImg)
        drawText(meme.lines)
    }
}

function createCanvas() {
    gElCanvas = document.getElementById('my-canvas')
    gCtx = gElCanvas.getContext('2d')
}

function coverCanvasWithImg(elImg) {
    gElCanvas.height = (elImg.naturalHeight / elImg.naturalWidth) * gElCanvas.width
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
}

function drawText(lines) {
    setTextBorder()
    lines.forEach(line => {
        gCtx.fillStyle = line.color
        gCtx.font = `${line.size}px ${line.font}`
        gCtx.fillText(line.text, line.pos.x, line.pos.y)

        // drawBorder(line)
    });
}

function drawBorder(line) {
    gCtx.strokeStyle = "black";
    gCtx.lineWidth = 1;
    gCtx.strokeRect(line.pos.x - 5, line.pos.y - line.height - 5, line.width + 10, line.height + 10);
}

function clearCanvas() {
    gCtx.fillStyle = '#faebd7'
    gCtx.fillRect(0, 0, gElCanvas.width, gElCanvas.height)
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

function onInput(value) {
    setLineText(value)
    renderMeme()
}

function onSortByInput(value) {
    renderMemeImages(value)
}

function onSortByText(el, value) {
    removeActive('.category>*')
    addActive(el)

    if (value === 'all') {
        searchText = ''
        renderMemeImages()
        clearSearchInput()
        return
    }

    if (searchText === value) return

    searchText = value
    updateKeyWordSearch(value)
    updateFavoriteFontSize(value, el)
    clearSearchInput()
    renderMemeImages(value)
}

function updateKeyWordSearch(value) {
    setKeyWordSearch(value)
    saveToStorage('key-word', getKeyWordSearchMap())
}

function updateFavoriteFontSize(value, el) {
    let currentSize = parseInt(window.getComputedStyle(el).fontSize)
    let newSize = currentSize + 1
    el.style.fontSize = `${newSize}px`

    const favoriteObjJSON = loadFromStorage('favorite-text') || {}
    favoriteObjJSON[value] = newSize;
    saveToStorage('favorite-text', favoriteObjJSON)
}

function renderFavoriteFontSize() {
    const favoriteObj = loadFromStorage('favorite-text')
    if (!favoriteObj) return

    const categoryContainer = document.querySelectorAll('.category >*:not(.all-text)')
    categoryContainer.forEach(el => {

        const currKey = favoriteObj[el.innerHTML]
        if (!currKey) return

        el.style.fontSize = `${currKey}px`
    })
}

function clearSearchInput() {
    const searchInput = document.querySelector('.search-input')
    searchInput.value = ''
}

function renderMemeImages(value) {
    let imgs;
    if (!value) {
        imgs = getImages()
    } else {
        imgs = getImages().filter(img => img.keywords.some(word => word.includes(value)))
    }
    const gallery = document.querySelector('.gallery-template')
    gallery.innerHTML = imgs.map(img => createImgHtml(img)).join('')
}

function createImgHtml(img) {
    return `<div class="template" onclick="onEditTemplate(${img.id})"><img src="${img.url}" alt=""></div>`
}

function onEditTemplate(imgId) {
    const gallery = document.querySelector('.gallery-container')
    const editor = document.querySelector('.editor-container')

    hideContainer(gallery)
    showContainer(editor)

    setGMemeId()
    gElImg = null
    clearGMeme()

    setMemeId(gMemeId)
    setImgId(imgId)
    setFirstLinePos()
    setEditor()
}

function setEditor() {
    clearCanvas()
    clearTextInput()
    removeActive('header nav>*')

    setPageIdx(1)
    renderStickers()
    setLineIdx(0)

    setToolsToSelectedLine()
    renderMeme()
}

function onAddLine() {
    const canvasCenterX = gElCanvas.width / 2
    const canvasCenterY = gElCanvas.height / 2

    const editorTextInput = document.getElementById('text-input')
    if (!editorTextInput.value) deleteLine()

    const lines = getLines().filter(line => line.isSticker === false)

    if (!lines.length) setFirstLinePos()
    else if (lines.length === 1) {
        setSecondLinePos()
    } else {
        addLine('', canvasCenterX / 1.3, canvasCenterY)
    }

    clearTextInput()
    setToolsToSelectedLine()
}

function onAddSticker(text) {
    const editorTextInput = document.getElementById('text-input')
    if (!editorTextInput.value) deleteLine()

    const canvasCenterX = gElCanvas.width / 2
    const canvasCenterY = gElCanvas.height / 2
    addLine(text, canvasCenterX, canvasCenterY)
    setSticker()

    clearTextInput()
    setToolsToSelectedLine()
    onAlignCenter()
}

function renderStickers() {
    const stickerContainer = document.querySelector('.stickers-container')
    const stickers = getStickers()
    stickerContainer.innerHTML = stickers.map(sticker => createStickerHtml(sticker)).join('')
}

function createStickerHtml(sticker) {
    return `<div class="sticker" onclick="onAddSticker('${sticker}')">${sticker}</div>`
}

function renderSavedMemes(memes) {
    if (!memes) return
    const memesContainer = document.querySelector('.memes-img')
    memesContainer.innerHTML = memes.map(meme => createMemeHtml(meme)).join('')
}

function createMemeHtml(meme) {
    return `<div class="edited-meme" onclick="editSavedMeme(${meme.memeId})"><img src="${meme.thumbnail}" alt=""></div>`
}

function editSavedMeme(memeId) {
    const memes = loadFromStorage('memes')
    const memeById = memes.find(meme => meme.memeId === memeId)

    setGMeme(memeById)
    gMemeId = memeById.memeId
    gElImg = null

    displayEditor()
    setEditor()
}

function onChangePage(value) {
    const pages = getPages()
    const pageIdx = getGPageIdx()
    const nextPage = pageIdx + value

    if (nextPage > pages) {
        setPageIdx(1)
        renderStickers()
        return
    }
    if (nextPage <= 0) {
        setPageIdx(pages)
        renderStickers()
        return
    }

    setPageIdx(nextPage)
    renderStickers()
}

function clearTextInput() {
    const textInput = document.getElementById('text-input')
    textInput.value = ''
}

function hideContainer(el) {
    el.style.display = 'none'
}

function showContainer(el) {
    el.style.display = 'block'
}

function onGallery() {
    const galleryHeader = document.querySelector('header .gallery')
    const gallery = document.querySelector('.gallery-container')
    const editor = document.querySelector('.editor-container')
    const memes = document.querySelector('.memes-container')

    removeActive('header nav>*')
    addActive(galleryHeader)

    hideContainer(memes)
    hideContainer(editor)
    showContainer(gallery)
}

function onMemes() {
    const memeHeader = document.querySelector('header .memes')
    const gallery = document.querySelector('.gallery-container')
    const editor = document.querySelector('.editor-container')
    const memesContainer = document.querySelector('.memes-container')

    removeActive('header nav>*')
    addActive(memeHeader)

    hideContainer(gallery)
    hideContainer(editor)
    showContainer(memesContainer)

    const memes = loadFromStorage('memes')
    renderSavedMemes(memes)
}

function addActive(el) {
    el.classList.add('active')
}

function removeActive(path) {
    const pathEls = document.querySelectorAll(path)
    pathEls.forEach(el => el.classList.remove('active'))
}

function setInputText(gMeme) {
    const textInput = document.getElementById('text-input')
    textInput.value = getSelectedLine().text
}

function onDeleteLine() {
    const gMeme = getMeme()
    deleteLine()
    clearTextInput()

    if (!gMeme.lines.length) setFirstLinePos()
    setLineIdx(0)
    setTextDrag(false)
    setToolsToSelectedLine()
    renderMeme()
}

function focusOnTextInput() {
    const textInput = document.getElementById('text-input')
    textInput.focus()
}

function onLineSwitch() {
    const gMeme = getMeme()
    if (gMeme.lines.length === 1 || !gMeme.lines.length) return

    let nextLineIdx;

    gMeme.selectedLineIdx + 1 > gMeme.lines.length - 1 ? nextLineIdx = 0 : nextLineIdx = gMeme.selectedLineIdx + 1

    setTextDrag(false)
    setLineIdx(nextLineIdx)
    setToolsToSelectedLine()
}

function onFontSize(value) {
    changeFontSize(value)
    renderMeme()
}

function onAlignLeft() {
    const selectedLine = getSelectedLine()
    selectedLine.pos.x = 0
    renderMeme()
}

function onAlignRight() {
    const selectedLine = getSelectedLine()
    const canvasWidth = gElCanvas.width
    selectedLine.pos.x = canvasWidth - selectedLine.width
    renderMeme()
}

function onAlignCenter() {
    const selectedLine = getSelectedLine()
    const canvasWidth = gElCanvas.width
    selectedLine.pos.x = canvasWidth / 2 - selectedLine.width / 2
    renderMeme()
}

function updateColor(value, type) {
    if (type === 'color') {
        const paletteEl = document.querySelector('.fa-palette')
        paletteEl.style.color = value
    }

    changeColor(value, type)
    renderMeme()
}

function onColor() {
    const colorInput = document.getElementById('colorPicker')
    colorInput.click()
}

function onStroke() {
    const gMeme = getMeme()
    const selectedLine = getSelectedLine()

    if (selectedLine.isStroke) {
        setTextStroke(false)
        clearCanvas()
        renderMeme()
    } else {
        setTextStroke(true)
        AddStroke(gMeme)
        const strokeInput = document.getElementById('strokeColorPicker')
        strokeInput.click()
    }
}

function onFontFamily(font) {
    changeFontFamily(font)
    renderMeme()
}

function onSaveMeme() {
    const gMeme = getMeme()
    const imgContent = gElCanvas.toDataURL('image/jpeg')
    gMeme.thumbnail = imgContent

    const memes = loadFromStorage('memes') || []
    const filteredMemes = memes.filter(meme => meme.memeId !== gMeme.memeId)

    filteredMemes.push(gMeme)

    saveToStorage('memes', filteredMemes)
    flashMsg('Meme Saved')
}

function setToolsToSelectedLine() {
    const gMeme = getMeme()
    focusOnTextInput()
    setInputText(gMeme)
    setFont(gMeme)
    setPaletteColor(gMeme)
    renderMeme()
}

function setGMemeId() {
    const memeId = loadFromStorage('memes')
    if (!memeId) {
        gMemeId = 0
    } else {
        gMemeId = memeId.length + 1
    }
}

function setPaletteColor(gMeme) {
    const paletteEl = document.querySelector('.fa-palette')
    const colorInput = document.getElementById('colorPicker')

    paletteEl.style.color = getSelectedLine().color
    colorInput.value = getSelectedLine().color
}

function setFont(gMeme) {
    const fontEl = document.querySelector('.font-change')
    fontEl.value = getSelectedLine().font
}

function AddStroke(gMeme) {
    const selectedLine = getSelectedLine()

    gCtx.strokeStyle = selectedLine.strokeColor
    gCtx.font = `${selectedLine.size}px ${selectedLine.font}`
    gCtx.strokeText(selectedLine.text, selectedLine.pos.x, selectedLine.pos.y)
}

function renderStroke() {
    const gMeme = getMeme()

    gMeme.lines.forEach(line => {
        if (line.isStroke) {
            gCtx.strokeStyle = line.strokeColor
            gCtx.font = `${line.size}px ${line.font}`
            gCtx.strokeText(line.text, line.pos.x, line.pos.y)
        }
    })
}

function flashMsg(msg) {
    const elMsg = document.querySelector('.user-msg')

    elMsg.innerText = msg
    elMsg.classList.add('open')
    setTimeout(() => elMsg.classList.remove('open'), 3000)
}

function displayEditor() {
    const gallery = document.querySelector('.gallery-container')
    const editor = document.querySelector('.editor-container')
    const memes = document.querySelector('.memes-container')

    removeActive('header nav>*')

    hideContainer(memes)
    hideContainer(gallery)
    showContainer(editor)
}

function setFirstLinePos() {
    const canvasCenterX = gElCanvas.width / 2
    const canvasCenterY = gElCanvas.height / 2
    addLine('', canvasCenterX / 1.3, canvasCenterY / 2 / 2)
}

function setSecondLinePos() {
    const canvasCenterX = gElCanvas.width / 2
    const canvasCenterY = gElCanvas.height
    const secondLineY = canvasCenterY / 2 / 2 / 2
    addLine('', canvasCenterX / 1.3, canvasCenterY - secondLineY)
}

