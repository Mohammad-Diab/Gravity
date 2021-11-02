var panal;

function createPanal() {
    if (panal) {
        panal.stop();
    }
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

    panal = new Gravity(ctx, canvas.width, canvas.height, techs);
    return panal;
}

function appendItems() {
    createPanal().init();
}

function applyGavity() {
    createPanal().drop();
}

function pointerPosition(event) {
    const canvas = document.getElementById('draw-panel');
    const rect = canvas.getBoundingClientRect();
    const point = event.changedTouches ? event.changedTouches[0] : event;
    return {
        x: (point.clientX - rect.left) * canvas.width / rect.width,
        y: (point.clientY - rect.top) * canvas.height / rect.height
    };
}

function onPointerDown(event) {
    if (event.button > 0) {
        return;
    }
    if (panal && panal.grab(pointerPosition(event))) {
        event.preventDefault();
    }
}

function onPointerMove(event) {
    if (panal && panal.dragItem) {
        event.preventDefault();
        panal.drag(pointerPosition(event));
    }
}

function onPointerUp() {
    if (panal) {
        panal.release();
    }
}

const drawPanel = document.getElementById('draw-panel');
drawPanel.addEventListener('mousedown', onPointerDown);
drawPanel.addEventListener('touchstart', onPointerDown, { passive: false });
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchmove', onPointerMove, { passive: false });
window.addEventListener('mouseup', onPointerUp);
window.addEventListener('touchend', onPointerUp);
window.addEventListener('touchcancel', onPointerUp);

class Text {
    constructor(ctx, text, color, fontSize, fontFamily, x, y) {
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.ctx = ctx;

        this.mass = text.length * 1.5;
        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        this.dx = Math.cos(this.angle) * 4;
        this.dy = Math.sin(this.angle) * 4;
        this.gravity = 0.5;
        this.elasticity = 0.5;
        this.friction = 0.5;
        this.airFriction = 0.003;
        this.maxSpeed = 40;
        this.sleeping = false;
        this.sleepTime = 0;
        this.dragged = false;
        this.measureBox();
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

    measureBox() {
        if (!this.box) {
            let bFont = this.ctx.font;
            this.ctx.font = `${this.fontSize} ${this.fontFamily}`;
            let reuslt = this.ctx.measureText(this.text);
            this.ctx.font = bFont;
            let left = -(reuslt.actualBoundingBoxLeft || 0);
            let top = -(reuslt.actualBoundingBoxAscent || 0);
            let right = reuslt.actualBoundingBoxRight || reuslt.width;
            let bottom = reuslt.actualBoundingBoxDescent || parseInt(this.fontSize);
            this.box = { left: left - 1, top: top - 1, width: right - left + 2, height: bottom - top + 2 };
        }
        return this.box;
    }

    get left() {
        return this.x + this.box.left;
    }

    get top() {
        return this.y + this.box.top;
    }

    get right() {
        return this.left + this.box.width;
    }

    get bottom() {
        return this.top + this.box.height;
    }

    get speed() {
        return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    }

    inverseMass() {
        return this.sleeping || this.dragged ? 0 : 1 / this.mass;
    }

    contains(point) {
        return point.x >= this.left - 6 && point.x <= this.right + 6 &&
            point.y >= this.top - 6 && point.y <= this.bottom + 6;
    }

    draw(color, x, y) {
        this.ctx.fillStyle = color ? color : this.color;
        this.ctx.font = `${this.fontSize} ${this.fontFamily}`;
        this.ctx.fillText(this.text, x ? x : this.x, y ? y : this.y);
    }

    animateDrow(timers) {
        this.x = this.initialX;
        for (let i = 0; i < 17; i++) {
            timers.push(setTimeout(() => {
                this.clear();
                this.y = this.initialY + 24 - i * 1.5;
                this.draw(this.toRgba `${this.color}${153+i*6+6}`);
            }, 10 * i));
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

    accelerate(gravity, friction, h) {
        if (this.sleeping || this.dragged) {
            return;
        }
        this.dy += gravity * h;
        this.dx -= this.dx * friction * h;
        this.dy -= this.dy * friction * h;
    }

    move(h) {
        if (this.sleeping) {
            return;
        }
        const speed = this.speed;
        if (speed > this.maxSpeed) {
            this.dx *= this.maxSpeed / speed;
            this.dy *= this.maxSpeed / speed;
        }
        this.x += this.dx * h;
        this.y += this.dy * h;
    }

    keepInside(width, height) {
        if (this.left < 0) {
            this.x -= this.left;
        } else if (this.right > width) {
            this.x -= this.right - width;
        }
        if (this.top < 0) {
            this.y -= this.top;
        } else if (this.bottom > height) {
            this.y -= this.bottom - height;
        }
    }

    itemHitWall(width, height, gap) {
        const walls = [
            { nx: 1, ny: 0, depth: -this.left },
            { nx: -1, ny: 0, depth: this.right - width },
            { nx: 0, ny: 1, depth: -this.top },
            { nx: 0, ny: -1, depth: this.bottom - height }
        ];
        return walls.filter(wall => wall.depth > -gap).map(wall => {
            return { a: null, b: this, nx: wall.nx, ny: wall.ny, depth: wall.depth };
        });
    }

    itemHitItem(item, gap) {
        const overlapX = Math.min(this.right, item.right) - Math.max(this.left, item.left);
        const overlapY = Math.min(this.bottom, item.bottom) - Math.max(this.top, item.top);
        if (overlapX <= -gap || overlapY <= -gap || Math.max(overlapX, overlapY) <= 0) {
            return null;
        }
        if (overlapX < overlapY) {
            const nx = item.left + item.right > this.left + this.right ? 1 : -1;
            return { a: this, b: item, nx: nx, ny: 0, depth: overlapX };
        }
        const ny = item.top + item.bottom > this.top + this.bottom ? 1 : -1;
        return { a: this, b: item, nx: 0, ny: ny, depth: overlapY };
    }

}

class Gravity {

    constructor(ctx, width, height, items) {
        ctx.textBaseline = "top";
        this.textColor = '#333333';
        this.fontSize = '36px';
        this.fontFamily = 'serif';
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.falling = false;
        this.spaceFriction = 0.08;
        this.substeps = 8;
        this.iterations = 60;
        this.frameTime = 1000 / 60;
        this.restSpeed = 0.08;
        this.restFrames = 30;
        this.bounceSpeed = 1;
        this.slop = 0.1;
        this.touchGap = 0.5;
        this.contactGap = 10;
        this.stiffGap = 3;
        this.frame = null;
        this.lastTime = null;
        this.lag = 0;
        this.timers = [];
        this.dragItem = null;
        this.throwSpeed = { x: 0, y: 0 };
        this.stopped = false;
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
            item.sleeping = true;
            item.dx = 0;
            item.dy = 0;
            this.timers.push(setTimeout(() => {
                item.animateDrow(this.timers);
            }, index * 100));
        });
    }

    drop() {
        this.falling = true;
        this.items.forEach(item => this.wake(item));
        this.render();
        this.start();
    }

    start() {
        if (!this.frame && !this.stopped) {
            this.frame = requestAnimationFrame(time => this.animate(time));
        }
    }

    stop() {
        this.stopped = true;
        if (this.frame) {
            cancelAnimationFrame(this.frame);
        }
        this.frame = null;
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
        this.dragItem = null;
    }

    wake(item) {
        item.sleeping = false;
        item.sleepTime = 0;
    }

    finishIntro() {
        if (this.timers.length) {
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers = [];
            this.items.forEach(item => {
                item.x = item.initialX;
                item.y = item.initialY;
            });
        }
    }

    grab(point) {
        if (this.stopped) {
            return false;
        }
        this.finishIntro();
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.contains(point)) {
                this.items.splice(i, 1);
                this.items.push(item);
                this.dragItem = item;
                this.dragOffset = { x: point.x - item.x, y: point.y - item.y };
                this.dragPoint = point;
                this.throwSpeed = { x: 0, y: 0 };
                item.dragged = true;
                item.dx = 0;
                item.dy = 0;
                this.wake(item);
                this.start();
                return true;
            }
        }
        return false;
    }

    drag(point) {
        if (this.dragItem) {
            this.dragPoint = point;
        }
    }

    release() {
        const item = this.dragItem;
        if (item) {
            item.dragged = false;
            item.dx = this.throwSpeed.x;
            item.dy = this.throwSpeed.y;
            this.wake(item);
            this.dragItem = null;
            this.start();
        }
    }

    animate(time) {
        this.frame = null;
        if (this.lastTime === null) {
            this.lastTime = time;
        }
        this.lag += Math.min(time - this.lastTime, 100);
        this.lastTime = time;
        while (this.lag >= this.frameTime) {
            this.step();
            this.lag -= this.frameTime;
        }
        this.render();

        if (this.dragItem || this.items.some(item => !item.sleeping)) {
            this.start();
        } else {
            this.lastTime = null;
            this.lag = 0;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.items.forEach(item => item.draw());
    }

    step() {
        const h = 1 / this.substeps;
        const dragItem = this.dragItem;
        const startX = dragItem ? dragItem.x : 0;
        const startY = dragItem ? dragItem.y : 0;

        for (let s = 0; s < this.substeps; s++) {
            this.items.forEach(item => {
                item.accelerate(this.falling ? item.gravity : 0, this.falling ? item.airFriction : this.spaceFriction, h);
            });
            this.followPointer();

            const contacts = this.findContacts();
            this.wakeTouching(contacts, h);
            contacts.forEach(contact => this.prepareContact(contact, h));
            this.stiffen(contacts);
            for (let i = 0; i < this.iterations; i++) {
                contacts.forEach(contact => this.collide(contact));
            }
            this.bounce(contacts);

            this.items.forEach(item => item.move(h));
            for (let i = 0; i < 2; i++) {
                this.findContacts().forEach(contact => this.separate(contact));
            }
            this.items.forEach(item => item.keepInside(this.width, this.height));
        }

        if (dragItem) {
            this.throwSpeed = { x: dragItem.x - startX, y: dragItem.y - startY };
        }
        this.items.forEach(item => {
            item.sleepTime = !item.dragged && item.speed < this.restSpeed ? item.sleepTime + 1 : 0;
        });
        this.sleepResting(this.findContacts().filter(contact => contact.depth > -this.touchGap));
    }

    followPointer() {
        const item = this.dragItem;
        if (item) {
            item.dx = this.dragPoint.x - this.dragOffset.x - item.x;
            item.dy = this.dragPoint.y - this.dragOffset.y - item.y;
        }
    }

    findContacts() {
        let contacts = [];
        this.items.forEach((item, index) => {
            contacts.push(...item.itemHitWall(this.width, this.height, this.contactGap));
            for (let j = index + 1; j < this.items.length; j++) {
                const contact = item.itemHitItem(this.items[j], this.contactGap);
                if (contact) {
                    contacts.push(contact);
                }
            }
        });
        return contacts;
    }

    islands(contacts) {
        let groups = this.items.map(item => [item]);
        let owner = new Map(this.items.map((item, index) => [item, index]));
        contacts.forEach(contact => {
            if (!contact.a) {
                return;
            }
            const from = owner.get(contact.a);
            const to = owner.get(contact.b);
            if (from === to) {
                return;
            }
            groups[to].forEach(item => owner.set(item, from));
            groups[from].push(...groups[to]);
            groups[to] = [];
        });
        return groups.filter(group => group.length);
    }

    wakeTouching(contacts, h) {
        const touching = contacts.filter(contact => {
            return contact.depth > -this.touchGap || this.relativeVelocity(contact).n < contact.depth / h;
        });
        this.islands(touching).forEach(group => {
            const moving = group.some(item => !item.sleeping && (item.dragged || item.sleepTime < this.restFrames));
            if (moving && group.some(item => item.sleeping)) {
                group.forEach(item => this.wake(item));
            }
        });
    }

    sleepResting(contacts) {
        this.islands(contacts).forEach(group => {
            if (group.every(item => !item.dragged && item.sleepTime >= this.restFrames)) {
                group.forEach(item => {
                    item.sleeping = true;
                    item.dx = 0;
                    item.dy = 0;
                });
            }
        });
    }

    relativeVelocity(contact) {
        const a = contact.a;
        const b = contact.b;
        const x = b.dx - (a ? a.dx : 0);
        const y = b.dy - (a ? a.dy : 0);
        return { n: x * contact.nx + y * contact.ny, t: y * contact.nx - x * contact.ny };
    }

    applyImpulse(contact, x, y) {
        if (contact.a) {
            contact.a.dx -= x * contact.invA;
            contact.a.dy -= y * contact.invA;
        }
        contact.b.dx += x * contact.invB;
        contact.b.dy += y * contact.invB;
    }

    prepareContact(contact, h) {
        const a = contact.a;
        const b = contact.b;
        contact.invA = a ? a.inverseMass() : 0;
        contact.invB = b.inverseMass();
        contact.invSum = contact.invA + contact.invB;
        contact.jn = 0;
        contact.jt = 0;
        contact.mu = a ? Math.sqrt(a.friction * b.friction) : b.friction;
        contact.elasticity = a ? Math.min(a.elasticity, b.elasticity) : b.elasticity;
        const closing = Math.min(contact.depth, 0) / h;
        const speed = this.relativeVelocity(contact).n;
        contact.impact = speed < -this.bounceSpeed && speed < closing;
        contact.target = contact.impact ? 0 : closing;
    }

    collide(contact) {
        if (contact.invSum === 0) {
            return;
        }
        let velocity = this.relativeVelocity(contact);
        const jn = Math.max(contact.jn + (contact.target - velocity.n) / contact.invSum, 0);
        const dn = jn - contact.jn;
        contact.jn = jn;
        this.applyImpulse(contact, contact.nx * dn, contact.ny * dn);

        velocity = this.relativeVelocity(contact);
        const limit = contact.mu * contact.jn;
        const jt = Math.min(Math.max(contact.jt - velocity.t / contact.invSum, -limit), limit);
        const dt = jt - contact.jt;
        contact.jt = jt;
        this.applyImpulse(contact, -contact.ny * dt, contact.nx * dt);
    }

    stiffen(contacts) {
        const near = contacts.filter(contact => contact.depth > -this.stiffGap);
        this.islands(near).forEach(group => {
            if (near.some(contact => contact.impact && group.includes(contact.b))) {
                near.forEach(contact => {
                    if (group.includes(contact.b)) {
                        contact.target = 0;
                    }
                });
            }
        });
    }

    bounce(contacts) {
        const pressed = contacts.filter(contact => contact.jn > 0);
        let hit = new Set();
        this.islands(pressed).forEach(group => {
            if (pressed.some(contact => contact.impact && group.includes(contact.b))) {
                group.forEach(item => hit.add(item));
            }
        });
        pressed.forEach(contact => {
            if (hit.has(contact.b)) {
                const jn = contact.jn * contact.elasticity;
                this.applyImpulse(contact, contact.nx * jn, contact.ny * jn);
            }
        });
    }

    separate(contact) {
        const a = contact.a;
        const b = contact.b;
        const invA = a ? a.inverseMass() : 0;
        const invB = b.inverseMass();
        if (invA + invB === 0 || contact.depth <= this.slop) {
            return;
        }
        const amount = (contact.depth - this.slop) * 0.8 / (invA + invB);
        if (a) {
            a.x -= contact.nx * amount * invA;
            a.y -= contact.ny * amount * invA;
        }
        b.x += contact.nx * amount * invB;
        b.y += contact.ny * amount * invB;
    }

}
