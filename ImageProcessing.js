let robot = lib220.loadImageFromURL('https://people.cs.umass.edu/~joydeepb/robot.jpg');

function removeBlueAndGreen(input_image){
  let copy_image = input_image.copy();
  let red_data = [];
  for (let i = 0; i < copy_image.width; ++i) {
    for (let j = 0; j < copy_image.height; ++j) {
      red_data = copy_image.getPixel(i, j);
      copy_image.setPixel(i, j, [red_data[0], 0.0, 0.0]);
    }
  }
  return copy_image;
}

function makeGrayscale(input_image){
  let copy_image = input_image.copy();
  let receive_data = [];
  let average = 0.0;
  for (let i = 0; i < copy_image.width; ++i) {
    for (let j = 0; j < copy_image.height; ++j) {
      receive_data = copy_image.getPixel(i, j);
      average = (receive_data[0] + receive_data[1] + receive_data[2]) / 3.0 ;
      copy_image.setPixel(i, j, [average, average, average]);
    }
  }
  return copy_image;
}

function mapToRed(input_array){
  let result = [];
  result.push(input_array[0]);
  result.push(0.0);
  result.push(0.0);
  return result;
}

function mapToGrayscale(input_array){
  let result = [];
  let average = (input_array[0] + input_array[1] + input_array[2]) / 3.0 ;
  result.push(average);
  result.push(average);
  result.push(average);
  return result;
}

function imageMap(input_image, f){
  let copy_image = input_image.copy();
  for (let i = 0; i < copy_image.width; ++i) {
    for (let j = 0; j < copy_image.height; ++j) {
      copy_image.setPixel(i, j, f(copy_image.getPixel(i, j)));
    }
  }
  return copy_image;
}

function highlightEdges(input_image){
  let copy_image = input_image.copy();
  let receive_data_01 = [];
  let receive_data_02 = [];
  let result_data = [];
  for (let i = 0; i < copy_image.width - 1; ++i) {
    for (let j = 0; j < copy_image.height; ++j) {
      receive_data_01 = copy_image.getPixel(i, j);
      receive_data_02 = copy_image.getPixel(i + 1, j);
      for (let n = 0; n < 3; ++n){
        result_data.push(Math.abs(receive_data_01[n] - receive_data_02[n]));
      }
      copy_image.setPixel(i, j, result_data);
      result_data = [];
    }
  }
  return copy_image;
}

function blurHelper(input_array, target_array){
  let result = input_array;
  for(let i = 0; i < 3; ++i){
    result[i] = result[i] + target_array[i];
  }
  return result;
}

function blur(input_image){
  let copy_image = input_image.copy();
  let receive_data = [];
  let result_data = [];
  for (let i = 1; i < copy_image.width - 1; ++i) {
    for (let j = 1; j < copy_image.height - 1; ++j) {

      receive_data = copy_image.getPixel(i, j);
      blurHelper(receive_data,copy_image.getPixel(i+1, j));
      blurHelper(receive_data,copy_image.getPixel(i+1, j+1));
      blurHelper(receive_data,copy_image.getPixel(i+1, j-1));
      blurHelper(receive_data,copy_image.getPixel(i-1, j));
      blurHelper(receive_data,copy_image.getPixel(i-1, j+1));
      blurHelper(receive_data,copy_image.getPixel(i-1, j-1));
      blurHelper(receive_data,copy_image.getPixel(i, j+1));
      blurHelper(receive_data,copy_image.getPixel(i, j-1));

      for (let n = 0; n < 3; ++n){
        result_data.push(receive_data[n]/9.0);
      }
      copy_image.setPixel(i, j, result_data);
      result_data = [];
    }
  }
  return copy_image;
}

function main(){
  robot.show();
  //removeBlueAndGreen(robot);
  //makeGrayscale(robot);
  let result_01 = imageMap(robot,mapToRed);
  //result_01.show();
  let result_02 = imageMap(robot,mapToGrayscale);
  //result_02.show();
  let result_03 = highlightEdges(robot);
  //result_03.show();
  let result_04 = blur(robot);
  result_04.show();
  
}


main(); 


function pixelEq (p1, p2) {
  const epsilon = 0.002;
  for (let i = 0; i < 3; ++i) {
    if (Math.abs(p1[i] - p2[i]) > epsilon) {
      return false;
    }   
  }
  return true;
};

test('removeBlueAndGreen function definition is correct', function() {
const white = lib220.createImage(10, 10, [1,1,1]);
removeBlueAndGreen(white).getPixel(0,0);
// Need to use assert
});

test('No blue or green in removeBlueAndGreen result', function() {
// Create a test image, of size 10 pixels x 10 pixels, and set it to all white.
const white = lib220.createImage(10, 10, [1,1,1]);
// Get the result of the function.
const shouldBeRed = removeBlueAndGreen(white);
// Read the center pixel.
const pixelValue = shouldBeRed.getPixel(5, 5);
// The red channel should be unchanged.
assert(pixelValue[0] === 1);
// The green channel should be 0.
assert(pixelValue[1] === 0);
// The blue channel should be 0.
assert(pixelValue[2] === 0);
});

test('Check pixel equality', function() {
const inputPixel = [0.5, 0.5, 0.5]
// Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
const image = lib220.createImage(10, 10, inputPixel);
// Process the image.
const outputImage = removeBlueAndGreen(image);
// Check the center pixel.
const centerPixel = outputImage.getPixel(5, 5);
assert(pixelEq(centerPixel, [0.5, 0, 0]));
// Check the top-left corner pixel.
const cornerPixel = outputImage.getPixel(0, 0);
assert(pixelEq(cornerPixel, [0.5, 0, 0]));
});