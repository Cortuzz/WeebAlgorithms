const boostCanvas1 = document.getElementById('1boost');
const boostCtx1 = boostCanvas1.getContext('2d');
const boostCanvas2 = document.getElementById('2boost');
const boostCtx2 = boostCanvas2.getContext('2d');
const boostCanvas3 = document.getElementById('3boost');
const boostCtx3 = boostCanvas3.getContext('2d');

boostCtxs = [ boostCtx1, boostCtx2, boostCtx3 ];

let boost1Gradient = ctx.createLinearGradient(0, 0, boostCanvas1.width, 0);
let boost2Gradient = ctx.createLinearGradient(0, 0, boostCanvas2.width, 0);
let boost3Gradient = ctx.createLinearGradient(0, 0, boostCanvas3.width, 0);

boost1Gradient.addColorStop(0, "lightgreen");
boost1Gradient.addColorStop(.5, "#2da42d");
boost1Gradient.addColorStop(1, "#093409");

boost2Gradient.addColorStop(0, "#d37575");
boost2Gradient.addColorStop(.5, "red");
boost2Gradient.addColorStop(1, "darkred");

boost3Gradient.addColorStop(0, "lightblue");
boost3Gradient.addColorStop(.5, "blue");
boost3Gradient.addColorStop(1, "darkblue");

gradients = [ boost1Gradient, boost2Gradient, boost3Gradient ];

function updateBoost(index, value) {
    boostCtxs[index].fillStyle = "aliceblue";
    boostCtxs[index].fillRect(0, 0, 430, 10);

    boostCtxs[index].fillStyle = gradients[index];
    boostCtxs[index].fillRect(0, 0, value * 430, 10);
}
