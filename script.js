function appendItems() {
    const canvas = document.getElementById('draw-panel');
    canvas.width = canvas.width;
    const ctx = canvas.getContext('2d');

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

    let panal = new Gravity(ctx, techs);
    panal.init();
}

function applyGavity() {

}

class Text {
    constructor(ctx, text, color, fontSize, fontFamily, x, y) {
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.initialX = x;
        this.initialY = y;
        this.ctx = ctx;
    }

    measureText() {
        if (!this.dimensions) {
            let bFont = this.ctx.font;
            this.ctx.font = `${this.fontSize} ${this.fontFamily}`;
            let reuslt = this.ctx.measureText(this.text);
            this.ctx.font = bFont;
            this.dimensions = [reuslt.width, reuslt.fontBoundingBoxAscent + reuslt.fontBoundingBoxDescent];
        }
        return this.dimensions;
    }

    drow(color, x, y) {
        this.ctx.fillStyle = color ? color : this.color;
        this.ctx.font = `${this.fontSize} ${this.fontFamily}`;
        this.ctx.fillText(this.text, x ? x : this.x, y ? y : this.y);
    }

    animateDrow() {
        this.x = this.initialX;
        for (let i = 0; i < 17; i++) {
            setTimeout(() => {
                this.clear();
                this.y = this.initialY + 24 - i * 1.5 - 1.5;
                this.drow(this.toRgba `${this.color}${153+i*6+6}`);
            }, 10 * i);
        }
    }

    clear() {
        const [width, height] = this.measureText();
        this.ctx.clearRect(this.x - 1, this.y - 1, width + 2, height + 2);
    }

    toRgba(template, ...params) {
        let hexVal = ('0' + params[1].toString(16)).slice(1);
        return `${params[0]}${hexVal}`
    }
}

class Gravity {

    constructor(ctx, items) {
        ctx.textBaseline = "top";
        this.textColor = '#333333';
        this.fontSize = '36px';
        this.fontFamily = 'serif';
        this.ctx = ctx;
        items.forEach(element => {
            this.appendItems(element);
        });
    }

    appendItems(item) {
        if (!this.items)
            this.items = [];
        this.items.push(new Text(this.ctx, item.name, this.textColor, this.fontSize, this.fontFamily, item.x, item.y));
    }

    init() {
        this.items.forEach((item, index) => {
            setTimeout(() => {
                item.animateDrow();
            }, index * 100);
        });
    }
}