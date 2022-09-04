import * as THREE from 'three'

export interface ITextSpriteConfig {
    position?: THREE.Vector3
    scale?: THREE.Vector3

    text: string
    size?: number
    color?: string
    maxLine?: number
    maxWidth?: number
}

export function getTextSprite(config: ITextSpriteConfig) {
    const spriteMap = new THREE.TextureLoader().load(drawTextCanvas(<IDrawTextCanvasOptions>{ ...config })?.toDataURL() || '')
    const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    if (config?.position) {
        sprite.position.set(config.position.x, config.position.y, config.position.z)
    }
    if (config?.scale) {
        sprite.scale.set(config.scale.x, config.scale.y, config.scale.z)
    }
    return sprite
}

interface IDrawTextCanvasOptions {
    text: string
    size?: number
    color?: string
    maxLine?: number
    maxWidth?: number
}
const drawTextCanvas = (options: IDrawTextCanvasOptions) => {
    let maxWidth = options.maxWidth || 300
    let maxLine = options.maxLine || 2

    let fontSize = options.size || 60
    //行高
    let lineHeigth = (fontSize * 4) / 3
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    canvas.width = maxWidth
    canvas.height = maxLine * (lineHeigth + (fontSize * 1) / 3)
    //经测试  如果用行数*行高来限制canvas的高度，会导致文字绘制被挤压的情况
    if (canvas.height < canvas.width / 2) {
        canvas.height = canvas.width / 2
    }

    if (ctx) {
        // ctx.fillStyle = 'rgba(0 ,0 ,0 ,0.5)'
        // ctx.fillRect(0, 0, canvas.width, canvas.height)
        let chr = options.text.split('') //这个方法是将一个字符串分割成字符串数组
        let temp = ''
        let row = []
        ctx.font = `${fontSize}px Verdana`
        ctx.fillStyle = options.color || '#FFF'
        for (let a = 0; a < chr.length; a++) {
            if (ctx.measureText(temp).width < (options.maxWidth ? options.maxWidth - (options.maxWidth * 1) / 6 : 250)) {
                temp += chr[a]
            } else {
                a-- //这里添加了a-- 是为了防止字符丢失，效果图中有对比
                row.push(temp)
                temp = ''
            }
        }
        row.push(temp)

        //如果数组长度大于2 则截取前两个
        if (row.length > maxLine) {
            let rowCut = row.slice(0, maxLine)
            let rowPart = rowCut[maxLine - 1] //获取最后一段文字
            let test = ''
            let empty = []
            for (let a = 0; a < rowPart.length; a++) {
                if (ctx.measureText(test).width < (options.maxWidth ? options.maxWidth - (options.maxWidth * 4) / 15 : 220)) {
                    test += rowPart[a]
                } else {
                    break
                }
            }
            empty.push(test)
            let group = empty[0] + '...' //这里只显示两行，超出的用...表示
            rowCut.splice(maxLine - 1, 1, group)
            row = rowCut
        }
        for (let b = 0; b < row.length; b++) {
            //垂直对齐方式
            ctx.textBaseline = 'middle'
            ctx.fillText(row[b], 10, lineHeigth + b * lineHeigth, maxWidth)
        }
        return canvas
    }
}
