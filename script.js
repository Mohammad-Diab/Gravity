function doThing() {
    const canvas = document.getElementById('draw-panel');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 200, 50);
}