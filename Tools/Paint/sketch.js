let currentColor = '#000000';
let brushSize = 10;
let history = [];
let currentDrawing = [];
let mode = 'paint';
let isDrawing = false;
let bgColor = '#ffffff';
let ribbonHeight = 50;
let brushSizeInput;

function setup() {
    createCanvas(1200, 800); // Increased canvas size
    background(bgColor);
    drawCanvasBorder();
  
    // Color Picker
    let colorPicker = createColorPicker('#000000');
    colorPicker.position(45, 10); // Adjusted position
    colorPicker.input(() => currentColor = colorPicker.value());
  
    // Add "Color Picker" label below the color picker
    let colorPickerLabel = createP('Color Picker');
    colorPickerLabel.position(30, 22); // Adjust the position below the color picker
  
    // Create individual radio buttons for Paint and Erase
    let paintButton = createRadio();
    paintButton.option('paint', 'Paint');
    paintButton.selected('paint');
    paintButton.position(200, 25); // Position Paint button
    paintButton.changed(() => mode = 'paint');
    paintButton.style('font-size', '18px');

    let eraseButton = createRadio();
    eraseButton.option('erase', 'Erase');
    eraseButton.position(300, 25); // Position Erase button, further apart
    eraseButton.changed(() => mode = 'erase');
    eraseButton.style('font-size', '18px');
  
    // Clear button
    let clearButton = createButton('Clear All');
    clearButton.position(1080, 10); // Adjusted position to the far right
    clearButton.mousePressed(clearCanvas);

    // Style the Clear All button to be larger
    clearButton.style('font-size', '18px'); // Increase font size
    clearButton.style('padding', '10px 20px'); // Add padding to make the button larger
  
    // Brush size slider
    let brushSizeSlider = createSlider(1, 100, 10);
    brushSizeSlider.position(500, 15); // Adjusted position for larger canvas
    brushSizeSlider.input(() => {
        brushSize = brushSizeSlider.value();
        brushSizeInput.value(brushSize); // Update the text box with the slider value
    });
  
    // Brush size input box
    brushSizeInput = createInput(brushSize);
    brushSizeInput.position(650, 15); // Position next to the slider
    brushSizeInput.size(50); // Width of the input box
    brushSizeInput.input(() => {
        let newSize = int(brushSizeInput.value()); // Get the input value as integer
        if (newSize >= 1 && newSize <= 100) { // Ensure it's within the slider range
            brushSize = newSize;
            brushSizeSlider.value(brushSize); // Update the slider with the input value
        }
    });
  
    // Add "Brush Size" label
    let brushSizeLabel = createP('Brush Size');
    brushSizeLabel.position(530, 15); // Adjust the position below the brush size slider
}

function draw() {
    fill(220);
    noStroke();
    rect(0, 0, width, ribbonHeight); // Ribbon area
  
    if (isDrawing && mode === 'paint' && mouseY > ribbonHeight) {
      stroke(currentColor);
      strokeWeight(brushSize);
      line(mouseX, mouseY, pmouseX, pmouseY);
      currentDrawing.push({ x: mouseX, y: mouseY, color: currentColor, size: brushSize });
    }
  
    if (isDrawing && mode === 'erase' && mouseY > ribbonHeight) {
      stroke(bgColor);
      strokeWeight(brushSize);
      line(mouseX, mouseY, pmouseX, pmouseY);
      currentDrawing.push({ x: mouseX, y: mouseY, color: bgColor, size: brushSize });
    }
}
  
function mousePressed() {
    if (mouseY > ribbonHeight) {
      isDrawing = true;
      currentDrawing = [];
    }
}
  
function mouseReleased() {
    isDrawing = false;
    if (currentDrawing.length > 0) {
      history.push([...currentDrawing]);
    }
}
  
function clearCanvas() {
    background(bgColor);
    drawCanvasBorder();
    history = []; // Reset the history since everything is cleared
}
  
function drawCanvasBorder() {
    noFill();
    stroke(0);
    strokeWeight(2);
    rect(0, ribbonHeight, width, height - ribbonHeight); // Draw border around canvas
}
