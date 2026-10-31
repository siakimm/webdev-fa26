// global variables
// stars and layers 
const STAR_COUNT     = 400;
const LAYER_COUNT    = 4;
const DRIFT_BASE     = 0.08;
const DRIFT_VARIANCE = 0.06;

// mouse interaction
const MOUSE_RADIUS   = 95;
const MOUSE_BOOST    = 2.4;

// star shimmer
const SHIMMER_SPEED  = 0.020;
const SHIMMER_AMP    = 0.25; 

// sparks around the mouse
const SPARK_RATE     = 2;
const SPARK_COUNT    = 10;

// ripples on click
const RIPPLE_SPEED   = 2.8;
const RIPPLE_LIFE    = 75;
const RIPPLE_BAND    = 30;

// parallax 
const PARALLAX_STR   = 18;

// colors
// blueish hues
const STAR_HUES  = [190, 200, 210, 215, 220, 225, 230, 235, 240];
// spark colors
const SPARK_HUES = [195, 205, 215, 220, 230, 240];

// layer definitions for stars: speed multiplier, size, alpha
const LAYER_DEFS = [
  { speedMult: 0.25, minR: 0.5, maxR: 1.0, minA: 35, maxA: 60  },
  { speedMult: 0.5,  minR: 0.8, maxR: 1.5, minA: 50, maxA: 75  },
  { speedMult: 0.85, minR: 1.2, maxR: 2.0, minA: 60, maxA: 88  },
  { speedMult: 1.4,  minR: 1.6, maxR: 2.8, minA: 70, maxA: 100 },
];

// arrays to store objects 
let stars     = [];
let sparks    = [];
let ripples   = [];
let parallaxX = 0;
let parallaxY = 0;
let fallingStars = [];

// utility functions 
// wrap stars around screen edges
function wrapCoord(val, max, pad) {
  if (val < -pad) return max + pad;
  if (val > max + pad) return -pad;
  return val;
}

// boost stars size when near mouse
function proximityBoost(dist, radius, maxBoost) {
  if (dist >= radius) return 1.0;
  let t = 1.0 - (dist / radius);
  return 1.0 + (maxBoost - 1.0) * t * t;
}

function calcRippleBoost(starX, starY, rip) {
  let d = dist(starX, starY, rip.x, rip.y);
  let diff = abs(d - rip.radius);
  if (diff > RIPPLE_BAND) return 0;
  return map(diff, RIPPLE_BAND, 0, 0, 1.6) * (rip.life / RIPPLE_LIFE);
}

function totalRippleBoost(starX, starY) {
  let total = 0;
  for (let r of ripples) {
    total = max(total, calcRippleBoost(starX, starY, r));
  }
  return total;
}

// background 
// sky gradient
function drawBackground() {
  let t = frameCount * 0.011;
  for (let y = 0; y <= height; y++) {
    let inter = y / height;
    let h = constrain(lerp(230, 200, inter) + sin(t) * 20, 0, 360);
    let s = constrain(lerp(50, 20, inter), 0, 100);
    let b = constrain(lerp(5, 95, inter) + sin(t) * 10, 0, 100);
    stroke(h, s, b, 100);
    line(0, y, width, y);
  }
}

// sparkles and ripples
function spawnSpark(x, y, speedMult) { sparks.push(new Spark(x, y, speedMult)); }

// ripple on click 
function spawnRipple(x, y) { ripples.push({ x, y, radius: 4, life: RIPPLE_LIFE }); }

function updateRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    r.radius += RIPPLE_SPEED;
    r.life -= 1.4;
    if (r.life <= 0) { ripples.splice(i, 1); continue; }
    drawRipple(r);
  }
}

function drawRipple(r) {
  let a = map(r.life, 0, RIPPLE_LIFE, 0, 55);
  noFill();
  stroke(215, 35, 100, a);
  strokeWeight(0.8);
  ellipse(r.x, r.y, r.radius * 2, r.radius * 2);
  stroke(205, 20, 100, a * 0.35);
  ellipse(r.x, r.y, r.radius * 2 * 0.6, r.radius * 2 * 0.6);
}

// parallax
function updateParallax() {
  let targetX = map(mouseX, 0, width, -PARALLAX_STR, PARALLAX_STR);
  let targetY = map(mouseY, 0, height, -PARALLAX_STR * 0.5, PARALLAX_STR * 0.5);
  parallaxX = lerp(parallaxX, targetX, 0.04);
  parallaxY = lerp(parallaxY, targetY, 0.04);
}

// star class
class Star {
  constructor(layerIndex) {
    this.layerIndex = layerIndex;
    this.def = LAYER_DEFS[layerIndex];
    this._init(true);
  }
  _init(randomStart) {
    let def = this.def;
    this.x = randomStart ? random(width) : -6;
    this.y = random(height);
    this.baseR = random(def.minR, def.maxR);
    this.baseA = random(def.minA, def.maxA);
    this.vx = (DRIFT_BASE + random(DRIFT_VARIANCE)) * def.speedMult;
    this.vy = random(-0.012, 0.012) * def.speedMult;
    this.phase = random(TWO_PI);
    this.sSpeed = SHIMMER_SPEED + random(-0.008, 0.008);
    this.hue = STAR_HUES[floor(random(STAR_HUES.length))];
    this.sat = random() < 0.4 ? random(0, 12) : random(18, 55);
    this.r = this.baseR;
    this.a = this.baseA;
    this.age = random(1000);
  }
  update() {
    this.age++;
    let pxFactor = map(this.layerIndex, 0, LAYER_COUNT - 1, 0.15, 1.0);
    this._drawX = this.x + parallaxX * pxFactor;
    this._drawY = this.y + parallaxY * pxFactor;

    this.x = wrapCoord(this.x + this.vx, width, 8);
    this.y = wrapCoord(this.y + this.vy, height, 8);

// shimmer oscillation
    let sine = sin(this.phase + this.age * this.sSpeed);
    this.r = this.baseR * (1 + sine * SHIMMER_AMP);
    this.a = this.baseA + sine * 18;

    let d = dist(this._drawX, this._drawY, mouseX, mouseY);
    let boost = proximityBoost(d, MOUSE_RADIUS, MOUSE_BOOST);
    this.r *= boost;
    this.a = min(100, this.a * boost);

// ripple effect boost
    let rBoost = totalRippleBoost(this._drawX, this._drawY);
    if (rBoost > 0) {
      this.r *= (1 + rBoost);
      this.a = min(100, this.a + rBoost * 55);
    }
  }
  draw() {
    let r = max(0.3, this.r);
    let a = constrain(this.a, 0, 100);
    noStroke();
    fill(this.hue, this.sat + 10, 100, a * 0.12);
    ellipse(this._drawX, this._drawY, r * 5.5, r * 5.5);
    fill(this.hue, this.sat, 100, a);
    ellipse(this._drawX, this._drawY, r * 2, r * 2);
    if (this.baseR > 1.4) {
      fill(210, 5, 100, a * 0.85);
      ellipse(this._drawX, this._drawY, r * 0.55, r * 0.55);
    }
  }
}

// spark class
class Spark {
  constructor(x, y, speedMult = 1.0) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    let speed = random(0.3, 1.9) * speedMult;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed - 0.35;
    this.maxLife = random(18, 40);
    this.life = this.maxLife;
    this.size = random(1.0, 2.4);
    this.hue = SPARK_HUES[floor(random(SPARK_HUES.length))];
    this.sat = random() < 0.35 ? random(0, 10) : random(25, 60);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.045;
    this.life--;
  }
  draw() {
    let t = this.life / this.maxLife;
    let a = t * t * 88;
    let sz = this.size * t;
    noStroke();
    fill(this.hue, this.sat, 100, a * 0.28);
    ellipse(this.x, this.y, sz * 3.5, sz * 3.5);
    fill(this.hue, this.sat * 0.4, 100, a);
    ellipse(this.x, this.y, sz, sz);
  }
  isDead() { return this.life <= 0; }
}

// falling shimmering stars class
class FallingStar {
  constructor() {
    this.x = random(width);
    this.y = random(-100, -10);
    this.size = random(1, 3);
    this.speed = random(3, 6);
    this.trail = [];
  }
  update() {
    this.y += this.speed;
    // add current position to trail
    this.trail.push({ x: this.x, y: this.y, size: this.size, alpha: 255 });
    // limit trail length
    if (this.trail.length > 40) this.trail.shift();

    // fade trail particles
    for (let t of this.trail) {
      t.alpha -= 6;
    }
  }
  draw() {
    // draw trail
    for (let t of this.trail) {
      noStroke();
      fill(60, 0, 100, t.alpha);
      ellipse(t.x, t.y, t.size);
    }
    // draw star
    noStroke();
    fill(60, 0, 100, 255);
    ellipse(this.x, this.y, this.size * 1.5);
  }
}

// setup 
function setup() {
  pixelDensity(1); // Keep the live portfolio responsive on high-density screens.
  frameRate(30);
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

// create stars per layer 
  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    let count = floor(STAR_COUNT / LAYER_COUNT);
    for (let i = 0; i < count; i++) {
      stars.push(new Star(layer));
    }
  }
}

// window resize 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let s of stars) {
    s.x = random(width);
    s.y = random(height);
  }
}

// draw loop
function draw() {
  drawBackground();
  updateParallax();
  updateRipples();

  for (let s of stars) {
    s.update();
    s.draw();
  }

  // sparks around mouse
  if (frameCount % SPARK_RATE === 0) {
    for (let k = 0; k < 2; k++) {
      spawnSpark(mouseX + random(-9, 9), mouseY + random(-9, 9), 1.0);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].draw();
    if (sparks[i].isDead()) sparks.splice(i, 1);
  }

  // falling stars
  for (let i = fallingStars.length - 1; i >= 0; i--) {
    fallingStars[i].update();
    fallingStars[i].draw();
    if (fallingStars[i].y > height + 20) fallingStars.splice(i, 1);
  }
}

// mouse interaction
function mousePressed(event) {
  if (event && event.target.tagName !== "CANVAS") return;
  spawnRipple(mouseX, mouseY);

  // falling stars across the screen limited to 100 total
  if (fallingStars.length < 100) {
    for (let i = 0; i < 50; i++) {
      fallingStars.push(new FallingStar());
    }
  }
}
// Touch support uses the same ripple interaction as the mouse.
function touchStarted(event) {
  if (event.target.tagName !== 'CANVAS') return;
  mousePressed(event);
  return false;
}
