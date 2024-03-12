// Define the Automata class and the GameOfLife subclass
class Automata {
  constructor(cols, rows, resolution) {
    this.cols = cols;
    this.rows = rows;
    this.resolution = resolution;
    this.grid = this.make2DArray(cols, rows);
  }

  countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let col = (x + i + this.cols) % this.cols;
        let row = (y + j + this.rows) % this.rows;

        sum += grid[col][row];
      }
    }
    sum -= grid[x][y];
    return sum;
  }

  make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
      arr[i] = new Array(rows).fill(0);
    }
    return arr;
  }

  initialize() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j] = floor(random(2)); // Randomly alive or dead
      }
    }
  }

  display(margin) {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let x = i * this.resolution + margin;
        let y = j * this.resolution + margin;
        if (this.grid[i][j] == 1) {
          fill(selectedTheme.cellColor); // Alive cell color
        } else {
          noFill(); // Dead cell, no fill
        }
        stroke(0);
        strokeWeight(0.5);
        rect(x, y, this.resolution - 1, this.resolution - 1);
      }
    }
  }

  nextGeneration() {
    throw new Error(
      "nextGeneration function should be implemented by subclasses"
    );
  }
}

class GameOfLife extends Automata {
  constructor(cols, rows, resolution) {
    super(cols, rows, resolution);
  }

  nextGeneration() {
    let next = this.make2DArray(this.cols, this.rows);

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let state = this.grid[i][j];
        let neighbors = this.countNeighbors(this.grid, i, j);

        if (state === 0 && config.birthRule.includes(neighbors)) {
          next[i][j] = 1;
        } else if (state === 1 && !config.survivalRule.includes(neighbors)) {
          next[i][j] = 0;
        } else {
          next[i][j] = state;
        }
      }
    }

    this.grid = next;
  }
}

class SymmetricAutomata extends Automata {
  constructor(cols, rows, resolution) {
    super(cols, rows, resolution);
    this.initializeSymmetric();
  }

  countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let col = (x + i + this.cols) % this.cols;
        let row = (y + j + this.rows) % this.rows;

        sum += grid[col][row];
      }
    }
    sum -= grid[x][y];
    return sum;
  }

  // Override the initialize method to ensure initial symmetry
  initializeSymmetric() {
    for (let i = 0; i < this.cols / 2; i++) {
      // Only iterate over half the grid
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j] = floor(random(2)); // Randomly alive or dead
        this.grid[this.cols - i - 1][j] = this.grid[i][j]; // Mirror the value on the right side
      }
    }
  }

  nextGeneration() {
    let next = this.make2DArray(this.cols, this.rows);
    let changes = 0; // To count state changes

    for (let i = 0; i < this.cols / 2; i++) {
      for (let j = 0; j < this.rows; j++) {
        let state = this.grid[i][j];
        let neighbors = this.countNeighbors(this.grid, i, j);

        if (state == 0 && neighbors == 3) {
          next[i][j] = 1;
          changes++;
        } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
          next[i][j] = 0;
          changes++;
        } else {
          next[i][j] = state;
        }

        next[this.cols - i - 1][j] = next[i][j];
      }
    }

    console.log("State changes in this generation:", changes); // Log state changes

    this.grid = next;
  }

  // You may need to override countNeighbors if you want to include/exclude mirrored cells in the neighbor count
}

// Base Frames class
class Frames {
  constructor(width, height, thickness) {
    this.width = width;
    this.height = height;
    this.thickness = thickness; // Thickness of the frame
  }

  // Method to display the frame - to be overridden by subclasses
  display() {
    throw new Error("Display method should be implemented by subclasses");
  }
}

class StraightFrame extends Frames {
  display() {
    fill(100); // Gray color for the frame pixels
    stroke(0); // Black stroke for each pixel
    strokeWeight(1); // Thin stroke

    // Draw pixels along the top and bottom
    for (let x = 0; x < this.width; x += this.thickness) {
      rect(x, 0, this.thickness, this.thickness); // Top border
      rect(x, this.height - this.thickness, this.thickness, this.thickness); // Bottom border
    }

    // Draw pixels along the sides
    for (let y = 0; y < this.height; y += this.thickness) {
      rect(0, y, this.thickness, this.thickness); // Left border
      rect(this.width - this.thickness, y, this.thickness, this.thickness); // Right border
    }
  }
}

// OrnateFrame subclass
class OrnateFrame extends Frames {
  display() {
    fill(150); // Slightly lighter gray for the frame pixels
    stroke(50); // Darker stroke for contrast
    strokeWeight(1);

    // Base frame (similar to StraightFrame)
    for (let x = 0; x < this.width; x += this.thickness) {
      rect(x, 0, this.thickness, this.thickness);
      rect(x, this.height - this.thickness, this.thickness, this.thickness);
    }
    for (let y = 0; y < this.height; y += this.thickness) {
      rect(0, y, this.thickness, this.thickness);
      rect(this.width - this.thickness, y, this.thickness, this.thickness);
    }

    // Decorations
    fill(255, 215, 0); // Gold color for decorations
    // Corner decorations
    rect(0, 0, this.thickness * 3, this.thickness * 3);
    rect(
      this.width - this.thickness * 3,
      0,
      this.thickness * 3,
      this.thickness * 3
    );
    rect(
      0,
      this.height - this.thickness * 3,
      this.thickness * 3,
      this.thickness * 3
    );
    rect(
      this.width - this.thickness * 3,
      this.height - this.thickness * 3,
      this.thickness * 3,
      this.thickness * 3
    );

    // Optional: Add more periodic decorations along the edges for more intricacy
  }
}

// Global variables for the sketch

let frame;
let frameTypes;
let automaton;
let automataTypes;

let frameCount = 0;

const config = {
  resolution: 10, // Size of each cell in the grid
  margin: 25, // Margin for the frame
  birthRule: [3], // Default rule for birth (e.g., for Game of Life: a cell is born if it has exactly 3 neighbors)
  survivalRule: [2, 3], // Default rule for survival (e.g., for Game of Life: a cell survives with 2 or 3 neighbors)
  // Add more configurations as needed
};
let colorThemes = [
  { bg: "#F0F0F0", cellColor: "#FF4500" }, // Existing Theme 1
  { bg: "#222222", cellColor: "#00FF00" }, // Existing Theme 2
  { bg: "#FFFFFF", cellColor: "#FF6347" }, // Existing Theme 3
  { bg: "#0D3B66", cellColor: "#FAF0CA" }, // New Theme 4: Deep blue background with cream cells
  { bg: "#540D6E", cellColor: "#EE4266" }, // New Theme 5: Dark purple background with bright pink cells
  { bg: "#FFE74C", cellColor: "#2D3142" }, // New Theme 6: Bright yellow background with dark gray cells
  { bg: "#2F4858", cellColor: "#F6AE2D" }, // New Theme 7: Dark slate background with golden cells
  { bg: "#33658A", cellColor: "#F6F7EB" }, // New Theme 8: Ocean blue background with off-white cells
  { bg: "#086788", cellColor: "#F0C808" }, // New Theme 9: Navy background with vibrant yellow cells
  { bg: "#2E294E", cellColor: "#EFBCD5" }, // New Theme 10: Deep indigo background with light pink cells
];

let selectedTheme;

function setup() {
  createCanvas(700, 700);
  let cols = (width - config.margin * 2) / config.resolution; // Use config.resolution here
  let rows = (height - config.margin * 2) / config.resolution; // And here as well

  // Randomly select a theme
  selectedTheme = random(colorThemes);

  // Set the background color from the selected theme
  background(selectedTheme.bg);

  automataTypes = [GameOfLife, SymmetricAutomata];

  // Randomly select and initialize an automata type
  let AutomataType = random(automataTypes);
  automaton = new AutomataType(cols, rows, config.resolution); // Pass config.resolution to the constructor
  automaton.initialize();

  // Define frame types
  frameTypes = [StraightFrame, OrnateFrame];

  // Randomly select and initialize a frame type
  let FrameType = random(frameTypes);
  frame = new FrameType(
    width - 2 * config.margin,
    height - 2 * config.margin,
    10
  ); // Use config.margin here
}

function draw() {
  background(selectedTheme.bg); // Refresh the background each frame

  // Display the frame
  push(); // Save the current drawing settings
  translate(config.margin, config.margin); // Use config.margin here
  frame.display(); // Display the selected frame type
  pop(); // Restore the drawing settings

  // Display the current state and compute the next generation
  automaton.display(config.margin); // Use config.margin here
  automaton.nextGeneration();

  if (frameCount % 20 === 0) {
    // Compute a new generation every 10 frames
    automaton.nextGeneration();
  }
  automaton.display(config.margin);
  frameCount++;
}
