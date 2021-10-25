function doThing() {
    const canvas = document.getElementById('draw-panel');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#333';
    ctx.font = '36px serif';
    ctx.fillText('CSS', 20, 40);
    ctx.fillText('HTML', 320, 40);
    ctx.fillText('JavaScript', 620, 40);
    ctx.fillText('ASP .NET', 20, 100);
    ctx.fillText('ReactJs', 320, 100);
    ctx.fillText('Blazor', 620, 100);
    ctx.fillText('Visual Basic .Net', 20, 160);
    ctx.fillText('C#', 320, 160);
    ctx.fillText('WPF', 620, 160);
}