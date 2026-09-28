let canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
let context = canvas.getContext("2d");


window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // rebuild everything that depends on canvas size
  createStars();
  createBuildings();
  createSolarZones();
    createObstacles();
    createMission(); 

  // snap drone back into visible area (if it was near an edge)
  if (drone.x > canvas.width - drone.size)  drone.x = canvas.width - drone.size;
  if (drone.y > canvas.height - drone.size) drone.y = canvas.height - drone.size;
});

function getGroundY()  { return canvas.height - 60; }
function getStreetTop() { return getGroundY() - 160; }  // street band is 160px tall
function getCeiling()   { return canvas.height * 0.32; } // drone can't fly above this

//state of the game
let gameState = "start";


//screen containers
let startScreen    = document.getElementById("startScreen");
let pauseScreen    = document.getElementById("pauseScreen");
let gameOverScreen = document.getElementById("gameOverScreen");




//button inputs
let startBtn     = document.getElementById("startBtn");
let pauseBtn     = document.getElementById("pauseBtn");
let resumeBtn    = document.getElementById("resumeBtn");
let restartBtn   = document.getElementById("restartBtn");
let playAgainBtn = document.getElementById("playAgainBtn");


//keyboard input
let keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

    if (e.key === "Escape") {
    if (gameState === "playing") {
      gameState = "paused";
      pauseScreen.classList.remove("hidden");
    } else if (gameState === "paused") {
      gameState = "playing";
      pauseScreen.classList.add("hidden");
    }
  }

});



window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;

  });

//button handling inputs
startBtn.addEventListener("click", () => {
  gameState = "playing";
    startScreen.classList.add("hidden");
});

pauseBtn.addEventListener("click", () => {
  if (gameState === "playing") {
     gameState = "paused";
    pauseScreen.classList.remove("hidden");
  }
});

resumeBtn.addEventListener("click", () => {
  gameState = "playing";
   pauseScreen.classList.add("hidden");
});

restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", restartGame);




//the drone which is the player
let drone = {
x: canvas.width / 2,
 y: canvas.height / 2,
 size: 18,
 velocityX: 0,
 velocityY: 0,
 acceleration: 0.18,     // how fast it speeds up
 maxSpeed: 2,            // top speed
 drag: 0.94,             // friction (0.94 = smooth glide, 1.0 = no drag)
 // orientation
  angle: 0,               // current facing angle (radians)


// resource management
  battery: 100,           // percentage
  drainRate: 0.06,        // battery % lost per frame while moving
  rechargeRate: 0.5       // battery % gained per frame inside a solar zone
};   

let score = 0;
let deliveries = 0;
let hitFlash = 0;
let distance = 0;
// DAY / NIGHT CYCLE 
let timeOfDay = 0;      // 0 → 1 loops forever
let daylight = 0;       // 0 = full night, 1 = full day (computed from timeOfDay)
let highScore = 0;

let stars = [];
let popups = [];
let buildings = [];
let solarZones = [];
let wind = {
  angle: Math.PI / 4,
  strength: 0.15,
  time: 0
};


//obstacles
let obstacles = [];
function createObstacles() {
  obstacles = [];

// 3 wildlife animals (circular)
  for (let i = 0; i < 3; i++) {
    obstacles.push(makeObstacle("wildlife"));
  }

// 3 potholes (circular)
  for (let i = 0; i < 3; i++) {
    obstacles.push(makeObstacle("pothole"));
  }

  // 2 flooding (rectangular)
  for (let i = 0; i < 2; i++) {
    obstacles.push(makeObstacle("flood"));
  }


 // 2 construction (rectangular)
  for (let i = 0; i < 2; i++) {
    obstacles.push(makeObstacle("construction"));
  } 


  // 2 traffic vehicles (rectangular, static)
  for (let i = 0; i < 2; i++) {
    obstacles.push(makeObstacle("traffic"));
  }
}


function makeObstacle(type) {

let x = 150 + Math.random() * (canvas.width - 300);
  let y = getStreetTop() + Math.random() * (getGroundY() - getStreetTop());
  let base = { type: type, x: x, y: y };

if (type === "wildlife") {
    base.radius = 18;
    base.penalty = 8;


   } else if (type === "pothole") {
    base.radius = 22;
    base.penalty = 5;
    
    
    } else if (type === "flood") {
    base.width = 90;
    base.height = 60;
    base.penalty = 10;


} else if (type === "construction") {
    base.width = 70;
    base.height = 70;
    base.penalty = 7;



    } else if (type === "traffic") {
    base.width = 55;
    base.height = 30;
    base.penalty = 9;


     }
  return base;
}



//mission delivery objective

let mission = null;

function createMission() {
   mission = {
    x: 200 + Math.random() * (canvas.width - 400),
     y: getStreetTop() + Math.random() * (getGroundY() - getStreetTop()),
    radius: 35,
    pulse: 0
  };
}
    


//particle for stars

function createStars() {
 stars = [];   
for (let i = 0; i < 120; i++) {

stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,   // top 60% only
      radius: Math.random() * 1.4 + 0.3,
      twinkle: Math.random() * Math.PI * 2       // for flicker effect

    });


  }
}

//the buidling architecture

function createBuildings() {
 buildings = [];
  let x = 0;
  while (x < canvas.width) {
   let width = 60 + Math.random() * 80;
    let height = 80 + Math.random() * 180; 
    buildings.push({  
        x: x,
      width: width,
      height: height, 
       windows: generateWindows(width, height)
    });
     x += width + 6;
  }
}

//window creator to also retrun arrays of small window rectaangles inside the bulding this also includes flicker effects
function generateWindows(w, h) {
  let windows = [];
  let cols = Math.floor(w / 22); 
  let rows = Math.floor(h / 30); 
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
        if (Math.random() > 0.55) {
        windows.push({
            x: 10 + c * 22,
          y: 20 + r * 30,
          on: Math.random() > 0.3      // some flicker off
        });
           }
    }
  }
  return windows;
}

//drawing functions of objects

function drawSky() {
  // interpolate between night and day colours based on daylight
  // daylight: 0 = night, 1 = day
  let dayR = Math.floor(10  + daylight * (135 - 10));
  let dayG = Math.floor(14  + daylight * (206 - 14));
  let dayB = Math.floor(26  + daylight * (235 - 26));

  let horizonR = Math.floor(42  + daylight * (255 - 42));
  let horizonG = Math.floor(26  + daylight * (180 - 26));
  let horizonB = Math.floor(46  + daylight * (120 - 46));

  let gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgb(" + dayR + "," + dayG + "," + dayB + ")");
  gradient.addColorStop(0.6, "rgb(" + Math.floor((dayR + horizonR) / 2) + "," +
   Math.floor((dayG + horizonG) / 2) + "," +
    Math.floor((dayB + horizonB) / 2) + ")");
  gradient.addColorStop(1, "rgb(" + horizonR + "," + horizonG + "," + horizonB + ")");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}


function drawStars() {

 // stars fade out as daylight rises
  let starAlpha = 1 - daylight;


 for (let star of stars) {
  // twinkle: oscillate alpha using sin
    star.twinkle += 0.05; 
    let alpha = 0.5 + Math.sin(star.twinkle) * 0.5;
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 255, 220, " + alpha + ")";
     context.fill();
  }
}

function drawMoon() {
  // ----- MOON (fades out in day) -----
  let moonAlpha = 1 - daylight;
  if (moonAlpha > 0.05) {
    context.globalAlpha = moonAlpha;
    context.beginPath();
    context.arc(canvas.width - 130, 80, 45, 0, Math.PI * 2);
    context.fillStyle = "#f5f0d0";
    context.shadowColor = "#f5f0d0";
    context.shadowBlur = 40;
    context.fill();
    context.shadowBlur = 0;
    context.globalAlpha = 1;
  }

  // ----- SUN (fades in during day, moves across the sky) -----
  let sunAlpha = daylight;
  if (sunAlpha > 0.05) {
    // sun travels across the sky as timeOfDay advances
    // at noon (timeOfDay = 0.25) it's at the top; at dawn/dusk it's low
    let sunX = canvas.width * timeOfDay;              // moves left → right
    let sunY = canvas.height * 0.15 + Math.cos(timeOfDay * Math.PI * 2) * 60;

    context.globalAlpha = sunAlpha;
    context.beginPath();
    context.arc(sunX, sunY, 42, 0, Math.PI * 2);
    context.fillStyle = "#ffe066";
    context.shadowColor = "#ffd633";
    context.shadowBlur = 60;
    context.fill();
    context.shadowBlur = 0;
    context.globalAlpha = 1;
  }
}

function drawBuildings() {
  let groundY = canvas.height - 60;

  for (let b of buildings) {
    let topY = groundY - b.height;

    // building body
    context.fillStyle = "#151824";
    context.fillRect(b.x, topY, b.width, b.height);
// windows
        for (let w of b.windows) {
      // at day, fewer windows appear lit (dim alpha)
      let litAlpha = w.on ? (1 - daylight * 0.75) : 0.2;
      context.fillStyle = "rgba(255, 204, 102, " + litAlpha + ")";
      context.fillRect(b.x + w.x, topY + w.y, 8, 10);
    }
  }
 // ground strip
  context.fillStyle = "#0d1018";
  context.fillRect(0, groundY, canvas.width, 60);
}
function drawDrone() {
  let x = drone.x;
  let y = drone.y;
  let s = drone.size;

  // light beam shining downward
  context.beginPath();
  context.moveTo(x - s, y + s);
  context.lineTo(x + s, y + s);
  context.lineTo(x + s * 3, y + s * 8);
  context.lineTo(x - s * 3, y + s * 8);
  context.closePath();
  context.fillStyle = "rgba(255, 220, 120, 0.08)";
  context.fill();

  // drone body (rotated triangle)
  context.save();
  context.translate(x, y);
   context.rotate(drone.angle);

  // body glow
  context.shadowColor = "#ffb347";
  context.shadowBlur = 18;
context.beginPath();
  context.moveTo(0, -s);          // nose
  context.lineTo(-s * 0.8, s);    // left wing
  context.lineTo(s * 0.8, s);     // right wing
context.closePath();
  context.fillStyle = "#ffb347";
  context.fill();
  context.shadowBlur = 0;


  // cockpit dot
  context.beginPath();
  context.arc(0, 0, 3, 0, Math.PI * 2);
context.fillStyle = "#0a0e1a";
  context.fill();

  context.restore();
}

function drawSolarZones() {
for (let zone of solarZones) {
zone.pulse += 0.03;
    let glow = 0.3 + Math.sin(zone.pulse) * 0.15;
// outer glow
    let gradient = context.createRadialGradient(
      zone.x, zone.y, 0,
      zone.x, zone.y, zone.radius
    );

gradient.addColorStop(0,   "rgba(255, 200, 80, " + glow + ")");
    gradient.addColorStop(0.7, "rgba(255, 160, 40, " + (glow * 0.4) + ")");
    gradient.addColorStop(1,   "rgba(255, 160, 40, 0)");

   context.beginPath();
    context.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    
    // ring outline
    context.beginPath();
    context.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    context.strokeStyle = "rgba(255, 200, 80, 0.6)";
    context.lineWidth = 2;
    context.stroke();
    
    
// small sun icon in centre
    context.beginPath();
    context.arc(zone.x, zone.y, 6, 0, Math.PI * 2);
    context.fillStyle = "#ffcc66";
    context.fill();
    
}

}

//drawing obstacles

function drawObstacles(){
for (let o of obstacles) {
if (o.type === "wildlife")    drawWildlife(o);
    if (o.type === "pothole")     drawPothole(o);
    if (o.type === "flood")       drawFlood(o);
    if (o.type === "construction") drawConstruction(o);
    if (o.type === "traffic")     drawTraffic(o);
}
}

function drawWildlife(o) {
  // brown body
  context.beginPath();
  context.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
  context.fillStyle = "#8b5a2b";
  context.fill();


 // horns (two small lines)
  context.strokeStyle = "#f0e0c0";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(o.x - 6, o.y - o.radius + 2);
  context.lineTo(o.x - 10, o.y - o.radius - 8);
  context.moveTo(o.x + 6, o.y - o.radius + 2);
  context.lineTo(o.x + 10, o.y - o.radius - 8);
  context.stroke();
  
  
// eyes
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(o.x - 5, o.y - 3, 2, 0, Math.PI * 2);
  context.arc(o.x + 5, o.y - 3, 2, 0, Math.PI * 2);
  context.fill();


}


function drawPothole(o) {
  context.beginPath();
  context.ellipse(o.x, o.y, o.radius, o.radius * 0.6, 0, 0, Math.PI * 2);
  context.fillStyle = "#1a1410";
  context.fill();
  context.strokeStyle = "#3a3020";
  context.lineWidth = 2;
  context.stroke();
}

function drawFlood(o) {
  context.beginPath();
  context.rect(o.x, o.y, o.width, o.height);
  context.fillStyle = "rgba(60, 130, 200, 0.55)";
  context.fill();
  context.strokeStyle = "rgba(120, 180, 240, 0.8)";
  context.lineWidth = 2;
  context.stroke();

 // water ripple lines
  context.strokeStyle = "rgba(200, 230, 255, 0.4)";
  context.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    context.beginPath();
    context.moveTo(o.x + 8, o.y + 15 + i * 15);
    context.lineTo(o.x + o.width - 8, o.y + 15 + i * 15);
    context.stroke(); 
    }
}

function drawConstruction(o) {
  context.fillStyle = "#3a3a3a";
  context.fillRect(o.x, o.y, o.width, o.height);

  // yellow-black stripes
  for (let i = 0; i < o.width; i += 14) {
    context.fillStyle = (i / 14) % 2 === 0 ? "#ffcc00" : "#1a1a1a";
    context.fillRect(o.x + i, o.y, 7, o.height);
  }


  context.strokeStyle = "#ffcc00";
  context.lineWidth = 2;
  context.strokeRect(o.x, o.y, o.width, o.height);
}

function drawTraffic(o) {
  // car body
  context.fillStyle = "#c0392b";
  context.fillRect(o.x, o.y, o.width, o.height);


 // windows
  context.fillStyle = "#87ceeb";
  context.fillRect(o.x + 8, o.y + 5, o.width * 0.4, o.height * 0.4);
  context.fillRect(o.x + o.width - 22, o.y + 5, o.width * 0.35, o.height * 0.4);


  // wheels
  context.fillStyle = "#111";
  context.beginPath();
  context.arc(o.x + 10, o.y + o.height, 5, 0, Math.PI * 2);
  context.arc(o.x + o.width - 10, o.y + o.height, 5, 0, Math.PI * 2);
  context.fill();
}


// ===== DRAW MISSION =====
function drawMission() {
  if (!mission) return;

  mission.pulse += 0.06;
  let glow = 0.5 + Math.sin(mission.pulse) * 0.3;

// outer halo
  let gradient = context.createRadialGradient(
    mission.x, mission.y, 0,
    mission.x, mission.y, mission.radius * 2
  );
  gradient.addColorStop(0,   "rgba(80, 220, 120, " + glow + ")");
  gradient.addColorStop(0.6, "rgba(80, 220, 120, " + (glow * 0.3) + ")");
  gradient.addColorStop(1,   "rgba(80, 220, 120, 0)");


context.beginPath();
  context.arc(mission.x, mission.y, mission.radius * 2, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();


 // inner circle (clinic marker)
  context.beginPath();
  context.arc(mission.x, mission.y, mission.radius, 0, Math.PI * 2);
  context.fillStyle = "rgba(80, 220, 120, 0.85)";
  context.fill(); 


    // white cross (medical / clinic symbol)
  context.fillStyle = "#ffffff";
  context.fillRect(mission.x - 4, mission.y - 14, 8, 28);
  context.fillRect(mission.x - 14, mission.y - 4, 28, 8);
}


function drawHUD() {

//  TOP BAR BACKGROUND 
context.fillStyle = "rgba(10, 14, 26, 0.55)";
  context.fillRect(0, 0, canvas.width, 70);
// SCORE (top-left)
  context.fillStyle = "#ffb347";
  context.font = "bold 22px Arial";
  context.textAlign = "left";
  context.fillText("SCORE: " + score, 24, 35);
//delivery
 context.fillStyle = "#7ddf9a";
  context.font = "bold 18px Arial";
  context.fillText("DELIVERIES: " + deliveries, 24, 58);

  //distance top center
 context.fillStyle = "#a8b2c1";
  context.font = "16px Arial";
  context.textAlign = "center";
  context.fillText("DISTANCE: " + Math.floor(distance) + " m", canvas.width / 2, 35);


  //battery bar top right
  let barWidth = 180;
  let barHeight = 20;
  let barX = canvas.width - barWidth - 90;   // 90px gap for pause button
  let barY = 25;



  //label
  context.fillStyle = "#a8b2c1";
  context.font = "13px Arial";
context.textAlign = "left";
  context.fillText("BATTERY", barX, barY - 6);

// background of the bar

context.fillStyle = "rgba(255, 255, 255, 0.15)";
  context.fillRect(barX, barY, barWidth, barHeight);

 // fill — colour depends on battery level
  let fillWidth = (drone.battery / 100) * barWidth;
  if (drone.battery > 50) {
      context.fillStyle = "#7ddf9a";       // green
  } else if (drone.battery > 20) {
    context.fillStyle = "#ffb347";       // amber
  } else {
context.fillStyle = "#ff4d4d";       // red
  }
  context.fillRect(barX, barY, fillWidth, barHeight);

  // outline
  context.strokeStyle = "rgba(255, 255, 255, 0.4)";
  context.lineWidth = 2;
  context.strokeRect(barX, barY, barWidth, barHeight);

// percentage text
  context.fillStyle = "#ffffff";
  context.font = "bold 14px Arial";
  context.textAlign = "right";
  context.fillText(Math.floor(drone.battery) + "%", barX + barWidth, barY - 6);

   // reset text align so other drawings aren't affected
  context.textAlign = "left";

   
}


// ===== FLOATING POPUPS =====
function spawnPopup(x, y, text, color) {
  popups.push({
    x: x,
    y: y,
    text: text,
    color: color,
    life: 90        // frames before disappearing
  });
}

function drawPopups() {
  for (let i = popups.length - 1; i >= 0; i--) {
    let p = popups[i];

    // fade + rise over time
    let alpha = p.life / 90;
    p.y -= 1.2;         // float upward
    p.life--;

    // draw
    context.globalAlpha = alpha;
    context.fillStyle = p.color;
    context.font = "bold 20px Arial";
    context.textAlign = "center";
    context.fillText(p.text, p.x, p.y);
    context.globalAlpha = 1;   // reset

    // remove when expired
    if (p.life <= 0) {
      popups.splice(i, 1);
    }
  }
  context.textAlign = "left";   // reset for other draws
}

//wind physics

  function updateWind() {
  wind.time += 0.005;
  
  // slowly rotate the wind direction using sin/cos
  wind.angle = Math.PI / 4 + Math.sin(wind.time) * Math.PI / 6;
}



//solar grid zones to recharge drone


function createSolarZones() {
  solarZones = [];
  for (let i = 0; i < 3; i++) {
    solarZones.push({
      x: 200 + Math.random() * (canvas.width - 400),
      y: canvas.height * 0.35 + Math.random() * (canvas.height * 0.2),
      radius: 60,
      pulse: 0              // for animated glow
    });
  }
}

//physics for movement
function updateDrone() {
  if (gameState !== "playing") return;
// reset velocity each frame (simple direct movement)
  //player input acceleration
if (keys["arrowleft"]  || keys["a"]) drone.velocityX -= drone.acceleration;
  if (keys["arrowright"] || keys["d"]) drone.velocityX += drone.acceleration;
  if (keys["arrowup"]    || keys["w"]) drone.velocityY -= drone.acceleration;
  if (keys["arrowdown"]  || keys["s"]) drone.velocityY += drone.acceleration;


//putting the wind trigonometry

//only apply wind if drone is moving
//(rotors counteract wind when hovering)
let currentSpeed = Math.sqrt(drone.velocityX ** 2 + drone.velocityY ** 2);
if (currentSpeed > 0.05) {
  let windX = Math.cos(wind.angle) * wind.strength;
  let windY = Math.sin(wind.angle) * wind.strength;
  drone.velocityX += windX;
  drone.velocityY += windY;
}


//Applying drag which is the friction
  drone.velocityX *= drone.drag;
   drone.velocityY *= drone.drag;

   //cap speed (recalculate AFTER wind + drag)
   let speed = Math.sqrt(drone.velocityX ** 2 + drone.velocityY ** 2);
  if (speed > drone.maxSpeed) {
    drone.velocityX = (drone.velocityX / speed) * drone.maxSpeed;
    drone.velocityY = (drone.velocityY / speed) * drone.maxSpeed;
  }
  
  //position update of drone
  drone.x += drone.velocityX;
  drone.y += drone.velocityY;

//track distance travelled
distance += speed * 0.1;



  //rotating drone toward movement direction
  if (speed > 0.1) {
   drone.angle = Math.atan2(drone.velocityY, drone.velocityX) + Math.PI / 2;
  }

  //battery drain feature
   if (speed > 0.2) {
    drone.battery -= drone.drainRate;
  }


  //solar zone recharge 
  for (let zone of solarZones) {
   let dx = drone.x - zone.x;
    let dy = drone.y - zone.y;
   let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist< zone.radius) {  
  drone.battery += drone.rechargeRate;
    }
  }


  //battery clamp
    if (drone.battery > 100) drone.battery = 100;
    if (drone.battery < 0)   drone.battery = 0;

     // ===== BATTERY DEATH → GAME OVER =====
  if (drone.battery <= 0) {
    gameOver();
    return;   // stop processing further code this frame
  }


  // keep drone on screen
  let margin = drone.size;
if (drone.x < margin) drone.x = margin;
if (drone.x > canvas.width - margin) drone.x = canvas.width - margin;


let ceiling = getCeiling();
if (drone.y < ceiling) drone.y = ceiling;
if (drone.y > canvas.height - margin) drone.y = canvas.height - margin;


  //delivery mission check

  if (mission) {
    let dx = drone.x - mission.x;
    let dy = drone.y - mission.y;
    let dist= Math.sqrt(dx * dx + dy * dy);


    if (dist < mission.radius) {
      deliveries++;
      score += 50;
      drone.battery = Math.min(100, drone.battery + 20);
      spawnPopup(mission.x, mission.y - 40, "+50 DELIVERED", "#7ddf9a");
      createMission();     // spawn a new one
    }
  }

//obstacle collision

for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];

if (checkCollision(drone, o)) {
      // penalty
      drone.battery -= o.penalty;
      if (drone.battery < 0) drone.battery = 0;

 // knockback away from obstacle
      let kx = drone.x - (o.x + (o.width  || 0) / 2);
      let ky = drone.y - (o.y + (o.height || 0) / 2);

     let kd = Math.sqrt(kx * kx + ky * ky) || 1;
      drone.velocityX += (kx / kd) * 4;
      drone.velocityY += (ky / kd) * 4;

     // hit flash
      hitFlash = 15;
      spawnPopup(drone.x, drone.y - 30, "-" + o.penalty, "#ff4d4d");
      // remove and respawn elsewhere
      obstacles.splice(i, 1);
      obstacles.push(makeObstacle(o.type));
    }
  }

}


// COLLISION ASSISTOR
function checkCollision(d, o) {
  // Circular obstacle (wildlife, pothole)
  if (o.radius) {
    let dx = d.x - o.x;
    let dy = d.y - o.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    return dist < o.radius + d.size;
  }
  // Rectangular obstacle (flood, construction, traffic) — AABB
  return (
    d.x - d.size < o.x + o.width  &&
    d.x + d.size > o.x            &&
    d.y - d.size < o.y + o.height &&
    d.y + d.size > o.y
  );
}



function restartGame() {
  pauseScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameState = "playing";


  //reset drone
  drone.x = canvas.width / 2;
 drone.y = canvas.height / 2;
 drone.velocityX = 0; 
 drone.velocityY = 0;
drone.battery = 100;
drone.angle = 0;

//reset counters
  score = 0;
  deliveries = 0;
  hitFlash = 0;
  distance=0;
    popups = [];

    //reset world
  createSolarZones();
  createObstacles();
  createMission();

  // update high score display
  document.getElementById("highScore").textContent = highScore;

}

function gameOver() {
  gameState = "over";

  // update high score if beaten
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("ecodash_highScore", highScore);
  }

  // fill in the game-over screen text
  document.getElementById("finalDistance").textContent = Math.floor(distance);
  document.getElementById("finalDeliveries").textContent = deliveries;
  document.getElementById("highScore").textContent = highScore;
  document.getElementById("startHighScore").textContent = highScore;

  // show the screen
  gameOverScreen.classList.remove("hidden");
}



//main loop of animation
function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  //  ADVANCE DAY/NIGHT CYCLE 
  timeOfDay += 0.0002;                      // speed of cycle
  if (timeOfDay > 1) timeOfDay = 0;         // loop

  // smooth 0 → 1 → 0 curve using sin
 daylight = (Math.sin(timeOfDay * Math.PI * 2) + 1) / 2;

  // background layers (painted back to front)
  drawSky();
  drawStars();
  drawMoon();
  drawBuildings();


  // world objects
  drawSolarZones();
  drawObstacles();
  drawMission();

  // player
  updateWind();
  updateDrone();
  drawDrone();

// floating feedback text
  drawPopups();


if (hitFlash > 0) {
    context.fillStyle = "rgba(255, 0, 0, " + (hitFlash / 40) + ")";
    context.fillRect(0, 0, canvas.width, canvas.height);
      hitFlash--;
  }

drawHUD();

  requestAnimationFrame(animate);
}
 
// LOAD HIGH SCORE FROM LOCALSTORAGE 
if (localStorage.getItem("ecodash_highScore")) {
  highScore = parseInt(localStorage.getItem("ecodash_highScore"));
}
// UPDATE START SCREEN WITH SAVED HIGH SCORE
let startHighEl = document.getElementById("startHighScore");
if (startHighEl) startHighEl.textContent = highScore;

//initialization
createStars();
createBuildings();
createSolarZones();
createObstacles();
createMission();
animate();