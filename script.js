function doThing() {
    const canvas = document.getElementById('draw-panel');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = "top";

    let techs = [
        { name: 'CSS', x: 20, y: 20 },
        { name: 'HTML', x: 320, y: 20 },
        { name: 'JavaScript', x: 620, y: 20 },
        { name: 'ASP .NET', x: 20, y: 80 },
        { name: 'ReactJs', x: 320, y: 80 },
        { name: 'Blazor', x: 620, y: 80 },
        { name: 'Visual Basic .Net', x: 20, y: 140 },
        { name: 'C#', x: 320, y: 140 },
        { name: 'WPF', x: 620, y: 140 }
    ];

    for (let i = 0; i < techs.length; i++) {
        setTimeout(() => {
            new Text(techs[i].name, '#333333', '36px', 'serif', techs[i].x, techs[i].y).animateInsert(ctx);
        }, i * 120);
    }
}

class Text {
    constructor(text, color, fontSize, fontFamily, x, y) {
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.x = x;
        this.y = y;
    }

    measureText(ctx) {
        let pFont = ctx.font;
        ctx.font = `${this.fontSize} ${this.fontFamily}`;
        let reuslt = ctx.measureText(this.text);
        ctx.font = pFont;
        return [reuslt.width + 2, reuslt.fontBoundingBoxAscent + reuslt.fontBoundingBoxDescent];
    }

    append(ctx, x, y, color) {
        ctx.fillStyle = color ? color : this.color;
        ctx.font = `${this.fontSize} ${this.fontFamily}`;
        ctx.fillText(this.text, x ? x : this.x, y ? y : this.y);
    }

    animateInsert(ctx) {
        const [width, height] = this.measureText(ctx);

        for (let i = 0; i < 17; i++) {
            let prevY = this.y + 24 - i * 1.5;
            setTimeout(() => {
                ctx.clearRect(this.x - 1, prevY, width, height);
                this.append(ctx, this.x, prevY - 1.5, this.toRgba `${this.color}${153+i*6+6}`);
            }, 15 * i);
        }
    }

    toRgba(template, ...params) {
        let hexVal = ('0' + params[1].toString(16)).slice(1);
        return `${params[0]}${hexVal}`
    }
}