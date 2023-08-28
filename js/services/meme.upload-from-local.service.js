
function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()

    reader.onload = function (event) {
        let img = new Image()
        img.src = event.target.result
        img.onload = () => onImageReady(img)
    }
    reader.readAsDataURL(ev.target.files[0])
}

function renderImg(img) {

    const gImgs = getImages()
    setNewImg(gImgs.length + 1, img.src)
    saveToStorage('imgs', gImgs)

    renderMemeImages()
    clearGMeme()

    setGMemeId()
    setUploadImg(img.src)
    setImgId(gImgs.length)
    gElImg = img

    setFirstLinePos()
    setMemeId(gMemeId)
    setEditor()
}

