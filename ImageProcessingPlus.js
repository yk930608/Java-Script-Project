
let robot = lib220.loadImageFromURL('https://people.cs.umass.edu/~joydeepb/robot.jpg');

//imageMap(img: Image, func: (p: Pixel) => Pixel):Image
//set the 
function imageMap(input_image, f){
  let copy_image = input_image.copy();
  for (let i = 0; i < copy_image.width; ++i) {
    for (let j = 0; j < copy_image.height; ++j) {
      copy_image.setPixel(i, j, f(copy_image.getPixel(i, j)));
    }
  }
  return copy_image;
}

//imageMapXY(img: Image, func: (img: Image, x: number, y: number) => Pixel):Image
//Return a image. The value of each pixel in the new image is the result of applying func to each pixel of img.
function imageMapXY(input_image, func){
  let copy_image = input_image.copy();
  for (let x = 0; x < copy_image.width; ++x) {
    for (let y = 0; y < copy_image.height; ++y) {
      copy_image.setPixel(x, y, func(copy_image, x, y));
    }
  }
  return copy_image;
}

/* imageMask(img: Image, func: (img: Image, x: number, y: number) => boolean, maskValue: Pixel): Image
The result must be a new image, where the value of pixel (x, y) is either (a) identical to
the value of the pixel (x, y) in the original image when func(img, x, y) returns false or (b) the
value maskValue when func(img, x, y) returns true.*/
function imageMask(input_image, func, maskValue){

  //maskIsGrayish(img: Image, x: number, y: number): Pixel
  function imageMask_helper(image, x, y){
    if (func(image, x, y)){
      return maskValue;
    }
    else{
      return image.getPixel(x, y);
    }
  }

  return imageMapXY(input_image,imageMask_helper);
}

//blurPixel(img: Image, x: number, y: number): Pixel
//The color channal value of each pixel in new image would be the mean of surrounding pixels' value.
function blurPixel(input_image, x, y){

  //add up all value of around pixel
  function blurHelper(input_array, target_array){
    let result = input_array;
    for(let i = 0; i < 3; ++i){
      result[i] = result[i] + target_array[i];
    } 
    return result;
  }

  let copy_image = input_image.copy();
  let num = 1;

  let receive_data = copy_image.getPixel(x, y);
  let result_data = [];

  if(x < copy_image.width - 1){
    blurHelper(receive_data,copy_image.getPixel(x+1, y)); 
    ++num;
  }

  if(x < copy_image.width - 1 && y < copy_image.height - 1){
    blurHelper(receive_data,copy_image.getPixel(x+1, y+1)); 
    ++num;
  }

  if(x > 0){
    blurHelper(receive_data,copy_image.getPixel(x-1, y));
    ++num;
  }

  if(x > 0 && y < copy_image.height - 1){
    blurHelper(receive_data,copy_image.getPixel(x-1, y+1));
    ++num;
  }
  
  if(y < copy_image.height - 1){
    blurHelper(receive_data,copy_image.getPixel(x, y+1));
    ++num;
  }
  
  if(y > 0){
    blurHelper(receive_data,copy_image.getPixel(x, y-1));
    ++num;
  }
  
  if(x > 0 && y > 0){
    blurHelper(receive_data,copy_image.getPixel(x-1, y-1));
    ++num;
  }

  if(x < copy_image.width - 1 && y > 0){
    blurHelper(receive_data,copy_image.getPixel(x+1, y-1));
    ++num;
  }

  for (let i = 0; i < 3; ++i){
    result_data.push(receive_data[i]/num);
  }
  
  return result_data;
}

//blurImage(img: Image): Image
//Call imageMapXY to excute funciton.
function blurImage(input_image){
  return imageMapXY(input_image,blurPixel);
}

//isGrayish(p: Pixel): boolean
//Determine whether pixel is grayish or not
function isGrayish(input_array){
  for (let i = 0; i < input_array.length; ++i){
    if(input_array[i] < 0.3 || input_array[i] > 0.7){
      return false;
    }
  }
  return true;
}

//toGrayscale(img: Image): Image , maskValue should equal to average of three elements
//Each grayish pixel replaced with a grayscale pixel computed by averaging the three color channels, and setting all three channels in the new pixel to this value.
function toGrayscale(input_image){

  //GrayscaleHelper(p: Pixel): pixel
  function GrayscaleHelper(input_array){
    let result = [];
    let average = (input_array[0] + input_array[1] + input_array[2]) / 3.0 ;
    result.push(average);
    result.push(average);
    result.push(average);
    return result;
  }

  //maskIsGrayish(img: Image, x: number, y: number): Pixel
  function maskIsGrayish(image, x, y){
    if (isGrayish(image.getPixel(x,y))){
      return GrayscaleHelper(image.getPixel(x,y));
    }
    else{
      return image.getPixel(x,y);
    }
  }
  return imageMapXY(input_image,maskIsGrayish);
}

//saturateHigh(img: Image): Image
//If any color channal value > 0.7, return[1.0, 1.0, 1.0], else return orginal value.
function saturateHigh(input_image){

  //helper: (img: Image, x: number, y: number) => Pixel
  function helper(image, x, y){
    let pixelValue = image.getPixel(x,y);
    for (let i = 0; i < pixelValue.length; ++i){
      if(pixelValue[i] > 0.7){
        return [1.0, 1.0, 1.0];
      }
    }
    return pixelValue;
  }
  return imageMapXY(input_image, helper);
}

//blackenLow(img: Image): Image
//If any color channal value < 0.3, return[0.0, 0.0, 0.0], else return orginal value.
function blackenLow(input_image){
  //helper: (img: Image, x: number, y: number) => Pixel
  function helper(image, x, y){
    let pixelValue = image.getPixel(x,y);
    for (let i = 0; i < pixelValue.length; ++i){
      if(pixelValue[i] < 0.3){
        return [0.0, 0.0, 0.0];
      }
    }
    return pixelValue;
  }
  return imageMapXY(input_image, helper);
}

//reduceFunctions(fa: ((p: Pixel) => Pixel)[] ): ((x: Pixel) => Pixel)
function reduceFunctions(input_array){
  
  //composite two function
  function composite(func1, func2){
    return func2(func1);
  }

  //take an argument as initial value 
  //composite(p:Pixel):Pixel
  return function(init){return input_array.reduce(composite, init);}
}

//colorize(img: Image): Image
//Implement three similar function with reduceFunctions function and imageMap function to achieve colorize.
function colorize(input_image){

  //GrayscaleHelper(p: Pixel): pixel
  function GrayscaleHelper(input_array){
    let result = [];
    let average = (input_array[0] + input_array[1] + input_array[2]) / 3.0 ;
    result.push(average);
    result.push(average);
    result.push(average);
    return result;
  }

  //toGrayscalePixel(p: Pixel):Pixel
  function toGrayscalePixel(input_array){
    if (isGrayish(input_array)){
      return GrayscaleHelper(input_array);
    }
    else{
      return input_array;
    }
  }

  //saturateHighPixel(p: Pixel):Pixel
  function saturateHighPixel(input_array){
    for (let i = 0; i < input_array.length; ++i){
      if(input_array[i] > 0.7){
        return [1.0, 1.0, 1.0];
      }
    }
    return input_array;
  }

  //blackenLowPixel(p: Pixel):Pixel
  function blackenLowPixel(input_array){
    for (let i = 0; i < input_array.length; ++i){
      if(input_array[i] < 0.3){
        return [0.0, 0.0, 0.0];
      }
    }
    return input_array;
  }

  return imageMap(input_image,reduceFunctions([toGrayscalePixel,saturateHighPixel,blackenLowPixel]));
}







colorize(robot).show();







// test area

function pixelEq (p1, p2) {
  const epsilon = 0.002;
  for (let i = 0; i < 3; ++i) {
    if (Math.abs(p1[i] - p2[i]) > epsilon) {
      return false;
    }   
  }
  return true;
};


test('Check function: imageMask', function() {
  function MaskCheck(image, x, y){
    if ((x+y) % 3 === 0){
      return true;
    }
    return false;
  }
  const inputPixel = [0.5, 0.5, 0.5];
  // Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(10, 10, inputPixel);
  // Process the image.
  const return_image = imageMask(image, MaskCheck, [1,1,1]);
  // Check the center pixel.
  const centerPixel = return_image.getPixel(5, 5);
  assert(pixelEq(centerPixel, [0.5, 0.5, 0.5]));
  // Check the top-left corner pixel.
  const top_left_cornerPixel = return_image.getPixel(0, 0);
  assert(pixelEq(top_left_cornerPixel, [1, 1, 1]));
  // Check the bottom-right corner pixel.
  const bottom_right_cornerPixel = return_image.getPixel(9, 9);
  assert(pixelEq(bottom_right_cornerPixel, [1, 1, 1]));
});


test('Check function: blurImage', function() {
  const inputPixel = [0.5, 0.5, 0.5];
  // Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(2, 2, inputPixel);
  image.setPixel(0,0,[0.1,0.1,0.1]);
  image.setPixel(1,1,[0.1,0.1,0.1]);
  // Process the image.
  const return_image = blurImage(image);
  // Check the center pixel.
  //const centerPixel = return_image.getPixel(5, 5);
  //assert(pixelEq(centerPixel, [0.5, 0.5, 0.5]));
  // Check the top-left corner pixel.
  const top_left_cornerPixel = return_image.getPixel(0, 0);
  //console.log(top_left_cornerPixel);
  assert(pixelEq(top_left_cornerPixel, [0.3, 0.3, 0.3]));
  // Check the bottom-right corner pixel.
  const bottom_right_cornerPixel = return_image.getPixel(1, 1);
  //console.log(bottom_right_cornerPixel);
  assert(pixelEq(bottom_right_cornerPixel, [0.265625, 0.265625, 0.265625]));
});

test('Check function: toGrayscale', function() {
  const inputPixel = [0.3, 0.5, 0.4];
  // Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(2, 2, inputPixel);
  image.setPixel(0,0,[0.1,0.2,0.3]);
  image.setPixel(0,1,[0.1,0.5,0.9]);
  image.setPixel(1,1,[0.6,0.5,0.4]);
  // Process the image.
  const return_image = toGrayscale(image);
  // Check the bottom-left corner pixel.
  const bottom_left_cornerPixel = return_image.getPixel(1, 0);
  //console.log("bottom_left_cornerPixel");
  //console.log(bottom_left_cornerPixel);
  assert(pixelEq(bottom_left_cornerPixel, [0.4, 0.4, 0.4]));
  // Check the top-left corner pixel.
  const top_left_cornerPixel = return_image.getPixel(0, 0);
  //console.log("top_left_cornerPixel");
  //console.log(top_left_cornerPixel);
  assert(pixelEq(top_left_cornerPixel, [0.1, 0.2, 0.3]));
  // Check the top-right corner pixel.
  const top_right_cornerPixel = return_image.getPixel(0, 1);
  //console.log("top_right_cornerPixel");
  //console.log(top_right_cornerPixel);
  assert(pixelEq(top_right_cornerPixel, [0.1, 0.5, 0.9]));
  // Check the bottom-right corner pixel.
  const bottom_right_cornerPixel = return_image.getPixel(1, 1);
  //console.log("bottom_right_cornerPixel");
  //console.log(bottom_right_cornerPixel);
  assert(pixelEq(bottom_right_cornerPixel, [0.5, 0.5, 0.5]));
});


test('Check function: saturateHigh', function() {
  const inputPixel = [0.9, 0.9, 0.9];
  // Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(2, 2, inputPixel);
  image.setPixel(0,0,[0.1,0.2,0.3]);
  image.setPixel(0,1,[0.1,0.5,0.9]);
  image.setPixel(1,1,[0.7,0.7,0.6]);
  // Process the image.
  const return_image = saturateHigh(image);
  // Check the center pixel.
  const bottom_left_cornerPixel = return_image.getPixel(1, 0);
  console.log("bottom_left_cornerPixel");
  console.log(bottom_left_cornerPixel);
  assert(pixelEq(bottom_left_cornerPixel, [1.0, 1.0, 1.0]));
  // Check the top-left corner pixel.
  const top_left_cornerPixel = return_image.getPixel(0, 0);
  console.log("top_left_cornerPixel");
  console.log(top_left_cornerPixel);
  assert(pixelEq(top_left_cornerPixel, [0.1, 0.2, 0.3]));
  // Check the top-right corner pixel.
  const top_right_cornerPixel = return_image.getPixel(0, 1);
  console.log("top_right_cornerPixel");
  console.log(top_right_cornerPixel);
  assert(pixelEq(top_right_cornerPixel, [1.0, 1.0, 1.0]));
  // Check the bottom-right corner pixel.
  const bottom_right_cornerPixel = return_image.getPixel(1, 1);
  console.log("bottom_right_cornerPixel");
  console.log(bottom_right_cornerPixel);
  assert(pixelEq(bottom_right_cornerPixel, [1.0, 1.0, 1.0]));
});

test('Check function: colorize', function() {
  const inputPixel = [0.4, 0.5, 0.6];
  // Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(2, 2, inputPixel);
  image.setPixel(0,0,[0.1,0.2,0.3]);
  image.setPixel(0,1,[0.1,0.5,0.9]);
  image.setPixel(1,1,[0.7,0.7,0.6]);
  // Process the image.
  const return_image = colorize(image);
  // Check the center pixel.
  const bottom_left_cornerPixel = return_image.getPixel(1, 0);
  console.log("bottom_left_cornerPixel");
  console.log(bottom_left_cornerPixel);
  assert(pixelEq(bottom_left_cornerPixel, [0.5, 0.5, 0.5]));
  // Check the top-left corner pixel.
  const top_left_cornerPixel = return_image.getPixel(0, 0);
  console.log("top_left_cornerPixel");
  console.log(top_left_cornerPixel);
  assert(pixelEq(top_left_cornerPixel, [0.0, 0.0, 0.0]));
  // Check the top-right corner pixel.
  const top_right_cornerPixel = return_image.getPixel(0, 1);
  console.log("top_right_cornerPixel");
  console.log(top_right_cornerPixel);
  assert(pixelEq(top_right_cornerPixel, [1.0, 1.0, 1.0]));
  // Check the bottom-right corner pixel.
  const bottom_right_cornerPixel = return_image.getPixel(1, 1);
  console.log("bottom_right_cornerPixel");
  console.log(bottom_right_cornerPixel);
  assert(pixelEq(bottom_right_cornerPixel, [1.0, 1.0, 1.0]));
});


  const inputPixel = [0.1, 0.6, 0.2];
  const image = lib220.createImage(2, 2, inputPixel);
  image.setPixel(1,0,[0.0,0.9,0.5]);
  image.setPixel(0,1,[0.9,0.0,0.2]);
  image.setPixel(1,1,[0.0,0.6,0.0]);
  // Process the image.
  const return_image = imageMask(image, function(img, x, y) {return (x % 2 === 0 || img.getPixel(x, y)[1] > 0.5);}, [0, 1, 0]);
  // Check the center pixel.
  const bottom_left_cornerPixel = return_image.getPixel(1, 0);
  console.log("bottom_left_cornerPixel");
  console.log(bottom_left_cornerPixel);

  const top_left_cornerPixel = return_image.getPixel(0, 0);
  console.log("top_left_cornerPixel");
  console.log(top_left_cornerPixel);

  const top_right_cornerPixel = return_image.getPixel(0, 1);
  console.log("top_right_cornerPixel");
  console.log(top_right_cornerPixel);

  const bottom_right_cornerPixel = return_image.getPixel(1, 1);
  console.log("bottom_right_cornerPixel");
  console.log(bottom_right_cornerPixel);
