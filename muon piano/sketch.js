var notes = ["C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"];
var blacks = ["C#5", "D#5", "", "F#5", "G#5", "A#5"];

var accents = new Map();

// one octave is about 18.5 x 14 cm = 260cm2
// at one per cm2 per minute, 4.3 muons per second
// meaning one every 232.5ms

var rate = 18.5 * 14 / 60;
var delay = 1000/rate;
var stdev = delay;

var timer = 0;
var keys = [];

var splashes = [];

var count = 0;

//synth
var synth = new Tone.PolySynth(8, Tone.Synth, {
  oscillator: {
    type: "triangle",
  },
  frequency: 200,
});

synth.set("detune", -1200);
synth.set("volume", -20);

//sampler envelope
synth.envelope = {
  attack: 0.2,
  decay: 0.2,
  sustain: 0.1,
  release: 0.4,
};

//compressor
var compressor = new Tone.Compressor({
  threshold: -30,
  ratio: 6,
  attack: 0.3,
  release: 0.1,
});

//bitcrusher
//var crusher = new Tone.BitCrusher(2);

//chorus
//var chorus = new Tone.Chorus(4, 2.5, 0.7);

//reverb
var reverb = new Tone.Reverb(6);
reverb.generate();

//vibrato
var vibrato = new Tone.Vibrato(5, 0.5);

//patching
synth.connect(vibrato);
vibrato.connect(compressor);
compressor.toMaster();

compressor.connect(reverb);
reverb.toMaster();

function setup() {
  createCanvas(400, 300);
  //console.log(pixelDensity());

  colorMode(HSB);
  let ws = 50;
  let wb = 90;
  let bs = 85;
  let bb = 50;
  accents.set("C5", color(0, ws, wb));
  accents.set("C#5", color(30, bs, bb));
  accents.set("D5", color(60, ws, wb));
  accents.set("D#5", color(90, bs, bb));
  accents.set("E5", color(120, ws, wb));
  accents.set("F5", color(150, ws, wb));
  accents.set("F#5", color(180, bs, bb));
  accents.set("G5", color(210, ws, wb));
  accents.set("G#5", color(240, bs, bb));
  accents.set("A5", color(270, ws, wb));
  accents.set("A#5", color(300, bs, bb));
  accents.set("B5", color(330, ws, wb));
  accents.set("C6", color(0, ws, wb));
  colorMode(RGB);

  let w = width / notes.length;

  for (let i = 0; i < blacks.length; i++) {
    if (blacks[i] != "") {
      let k = new Key(
        blacks[i],
        i * w + w * 0.75,
        0,
        w * 0.5,
        height*0.6,
        accents.get(blacks[i])
      );
      keys.push(k);
    }
  }

  for (let i = 0; i < notes.length; i++) {
    let k = new Key(notes[i], i * w, 0, w, height, accents.get(notes[i]));
    keys.push(k);
  }
}

function draw() {
  background(255);

  for (let i = keys.length - 1; i >= 0; i--) {
    noFill();
    keys[i].draw();
  }

  for (let s of splashes) {
    s.draw();
    if (s.dead()) {
      splashes.shift();
    }
  }

  if (millis() >= timer) {
    // Times up
    var x = random(width);
    var y = random(height);

    splashes.push(new Splash(x, y));
    playNote(checkKeys(x, y));

    count++;

    //let rand = -1;
    //while (rand < 0) {
    //  rand = randomGaussian(delay, stdev);
    //}
    
    let rand = randomGaussian(delay, stdev);
    rand = max(rand, 0);
    
    console.log(rand.toFixed(0));
    //timer = millis() + rand;
    timer = timer + rand;
  }

  noStroke();
  fill(100);
  textSize(6);
  textAlign(RIGHT);
  text(str((millis() / 1000).toFixed(2))+" s", width - 5, height - 5);

  textAlign(LEFT);
  text(str(((count / millis())/rate*1000).toFixed(1)+" µ/cm²/min"), 5, height - 5);
}

function mouseClicked() {
  splashes.push(new Splash(mouseX, mouseY));
  playNote(checkKeys(mouseX, mouseY));
}

function playNote(note) {
  synth.triggerAttackRelease(note, 0.4);
}

class Key {
  constructor(note, x, y, w, h, accent) {
    this.note = note;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.accent = accent;

    this.pressTime = -5000;

    if (note.includes("#")) {
      this.black = true;
    } else {
      this.black = false;
    }

    this.life = 1000;
  }

  draw() {
    stroke(0);

    if (this.black) {
      fill(0);
    } else {
      fill(255);
    }
    rect(this.x, this.y, this.w, this.h);

    if (this.pressTime + this.life > millis()) {
      this.accent.setAlpha(map(millis() - this.pressTime, 0, 1000, 1, 0));
      fill(this.accent);
    }
    rect(this.x, this.y, this.w, this.h);
  }

  checkCoord(x, y) {
    if (this.x <= x && x < this.x + this.w) {
      if (this.y <= y && y < this.y + this.h) {
        this.pressTime = millis();
        return true;
      }
    }
    return false;
  }
}

function checkKeys(x, y) {
  for (let key of keys) {
    if (key.checkCoord(x, y)) {
      return key.note;
    }
  }
  return "";
}

class Splash {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.t = millis();
    this.life = 600;
  }

  draw() {
    noFill();
    stroke(0, 0, 0, floor(map(millis() - this.t, 0, 1000, 255, 0)));
    circle(this.x, this.y, floor(map(millis() - this.t, 0, this.life, 2, 30)));
  }

  dead() {
    if (millis() > this.t + this.life) {
      return true;
    }
    return false;
  }
}
