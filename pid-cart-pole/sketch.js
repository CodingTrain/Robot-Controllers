// Cart Pole Simulation
// PID Controller
// p5.js and Matter.js
// Daniel Shiffman and Christian Hubicki
// Live stream archive: https://youtu.be/fWQWX9-8_sA

// module aliases
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Constraint = Matter.Constraint;
const Vector = Matter.Vector;

// Matter Engine and World
let engine, world;

// Bodies in the World
let ground, cart, bob;

// Sliders for P and D gain
let pGainSlider, dGainSlider;

// Previous angle to track angular velocity
let prevAngle = 0;

function setup() {
  createCanvas(600, 300).mousePressed(pushBob);

  buildWorld();
  buildCartPole();

  // Sliders for gain
  pGainSlider = createSlider(0, 0.01, 0.0, 0.001);
  createSpan('P Gain<br/>');
  dGainSlider = createSlider(0, 0.01, 0.0, 0.001);
  createSpan('D Gain');

  createP('Click in the canvas to destabilize pendulum.');
  createButton('reset').mousePressed(function () {
    buildWorld();
    buildCartPole();
  });
}

function buildWorld() {
  // Create the world
  engine = Engine.create();
  world = engine.world;

  // Options for static boundaries
  const options = {
    friction: 0,
    restitution: 1.0,
    angle: 0,
    isStatic: true,
  };

  // The ground
  ground = Bodies.rectangle(width * 0.5, 295, width, 100, options);
  ground.w = width;
  ground.h = 100;
  World.add(world, ground);

  // Walls to block cart from leaving the canvas
  let rightWall = Bodies.rectangle(width, 150, 10, height, options);
  let leftWall = Bodies.rectangle(0, 150, 10, height, options);
  World.add(world, rightWall);
  World.add(world, leftWall);
}

function buildCartPole() {
  // Length of "pole"
  let restLength = 100;

  // The cart
  cart = Bodies.rectangle(width * 0.5, 240, 40, 20, {
    friction: 0,
    restitution: 0,
    angle: 0,
    isStatic: false,
  });
  cart.w = 40;
  cart.h = 20;
  World.add(world, cart);

  // Bob (attached to top of pole)
  bob = Bodies.circle(cart.position.x, cart.position.y - restLength, 10, {
    friction: 0,
    restitution: 0.5,
    angle: 0,
    isStatic: false,
  });
  bob.r = 10;
  World.add(world, bob);

  // The "pole" is a constrain between cart and bob
  const constraint = Constraint.create({
    bodyA: cart,
    bodyB: bob,
    length: restLength,
    stiffness: 1,
  });
  World.add(world, constraint);
}

// Key presses to push on the bob and destabilize the pole
function pushBob() {
  let fx = 0.002;
  if (bob.position.x > mouseX) fx *= -1;
  const force = Vector.create(fx, 0);
  Body.applyForce(bob, bob.position, force);
}

function draw() {
  background(51);

  // Update the engine
  Engine.update(engine);

  // Draw the ground
  noStroke();
  fill(112, 50, 126);
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, ground.w, ground.h);

  // What is the pendulum arm angle?
  // TODO: is this a property that exists already in constraint object?
  let arm = createVector();
  arm.x = bob.position.x - cart.position.x;
  arm.y = bob.position.y - cart.position.y;
  let angle = arm.heading() + PI / 2;

  // Derivative of angle (angular velocity)
  let dt = 1;
  let angleV = (angle - prevAngle) / dt;
  // Save previous angle
  prevAngle = angle;

  // P Controller!
  let error = 0 - angle;
  let pGain = pGainSlider.value();
  let dGain = dGainSlider.value();

  // TODO: why is pGain negative here? (flipped y axis?)
  // PD Controller!
  let fx = -pGain * error + dGain * angleV;
  const force = Vector.create(fx, 0);

  // Apply the force!
  Body.applyForce(cart, cart.position, force);

  // Draw the pole
  stroke(255);
  strokeWeight(4);
  line(cart.position.x, cart.position.y, bob.position.x, bob.position.y);

  // Drawing the cart
  noStroke();
  fill(45, 197, 244);
  rect(cart.position.x, cart.position.y, cart.w, cart.h);

  // Drawing the bob
  fill(240, 99, 164);
  circle(bob.position.x, bob.position.y, bob.r * 2);
}
