// globals used between draw calls
let drawInstructions = makeInstructions('0',7);
let branchAngle = Math.PI / 12;
let weight = 0.001;
let targetAngle = Math.PI *2/3;
let prevAngle = Math.PI / 12;

// NOTE: setup() and draw() are automatically called by p5.js
//        - setup() is called once when the page loads
//        - draw() is called at the beginning of every animation frame, meaning it is called over and over until the page is closed

// make an html canvas filling the window
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

// draws a different tree every frame
function draw() {
  background(220);
  
  //  Using asymptotic averaging with linearly increasing weight to control the animation speed
  //  This just means the animation starts off slow, speeds up in the middle, then slows down again at the end
  if (weight < 0.05)  
    weight += 0.001
  let angleIncrement = (targetAngle - branchAngle) * weight;
  branchAngle += angleIncrement;
  
  // draw all the lines for our tree
  drawTree(drawInstructions, branchAngle);
  
  // swap animation direction once it starts to slow down
  if ( Math.abs(angleIncrement) < 0.0001){
    weight = 0.001; // also reset weight to original value, so it's slower at the start
    let temp = targetAngle;
    targetAngle = prevAngle;
    prevAngle = temp;
  }

}

// used to draw branches coming from a shared position
class PenInfo{
  constructor(position, angle){
    this.position = position;
    this.angle = angle;
  }
}

// reads an L-system string, translates characters into canvas draw instructions
function drawTree(instructions, branchAngle){
  let position = createVector(width/2,height - 20);
  let branchLength = 20;
  let angle = 3 * Math.PI/2;
  
  let turtleStack = [];
  
  for ( let character of drawInstructions ){
    switch (character){
      case '0':
      case '1':
        position = drawRay(position, angle);
        break;
      case '[':
        turtleStack.push( new PenInfo(position, angle));
        angle += branchAngle;
        break;
      case ']':
        let oldPen = turtleStack.pop();
        position = oldPen.position;
        angle = oldPen.angle - branchAngle;
        break;
      case '+':
        turtleStack.push( new PenInfo(position, angle));
        break;
      case '-':
        let oldPen2 = turtleStack.pop();
        position = oldPen2.position;
        angle = oldPen2.angle;
        break;
    }
    
  } 
}

// convenience for drawing lines from a starting position, angle, and magnitude
function drawRay(position, angle, magnitude = 5){
  let endPosition = createVector(position.x + magnitude*cos(angle), 
                                 position.y + magnitude*sin(angle));
  line(position.x, 
       position.y, 
       endPosition.x,
       endPosition.y
       );
  return endPosition; // used to change the pen position after drawing brances
}

// L-system producing instructions for a ternary fractal tree
function makeInstructions(input, iterations){
  if ( iterations == 0)
      return input;
  
  let newInstructions = "";
  for (let character of input) {
    switch (character) {
      case '1':
        newInstructions += "11";
        break;
      case '0':
        newInstructions += "1+0-[0]0"
        break;
      default:
        newInstructions += character;
        break;
    }
  }
  return makeInstructions(newInstructions, iterations-1);
}
