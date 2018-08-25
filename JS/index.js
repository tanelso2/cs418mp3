var targetWidth = 1920;
var targetHeight = 1080;
var targetAspectRatio = targetWidth / targetHeight; // 16:9

var canvas = null; // JQuery Object
var canvasHolder = null; // JQuery Object
var canvasElement = null; // DOM Element
var gl = null; // WebGL Context.

var currentTimeStamp = 0.0;
var deltaTime = 0.0;
var previousTimeStamp = 0.0;

var envLoad = null;
var tLoad = null;

$(document).ready(function () {
    // Set up the fullpage.js
    //  Set the scrollbar to be shown.
    $('#fullpage').fullpage({
        scrollBar: true
    });

    //  Disable Mouse Wheel Scrolling.
    $.fn.fullpage.setMouseWheelScrolling(true);
});

//  When the window loads.
$(window).load(function () {
    //  Set up the canvas to the correct dimensions
    setUpCanvas();
    initializeWebGL();
    initializeProgram();
});

//  When the window is resized
$(window).resize(function () {
    //  Resize the canvas to the appropriate dimensions
    resizeCanvas();
    setGLViewport();
});

function setUpCanvas() {
    //  Get the DOM Elements through JQuery
    canvas = $("#canvas");
    canvasHolder = $("#canvasHolder");
    resizeCanvas();
}


function resizeCanvas() {
    //  Allow the canvas to have a maximum width and height
    var availableHeight = canvasHolder.height() * 0.95;
    var availableWidth = canvasHolder.width() * 0.95;


    //  Compute 
    var cWidth = targetWidth; //  
    var cHeight = targetHeight; //

    var scaleFactor = 1.0; //  



    if (cHeight > availableHeight) //  Check if it bound by the height
    {
        scaleFactor = availableHeight / cHeight; //  Calculate the scale, and scale down
        console.log("Scale Factor H : " + scaleFactor); //  This ensures that we are always within the height
        cWidth = cWidth * scaleFactor; //  
        cHeight = cHeight * scaleFactor; //  
    }

    if (cWidth > availableWidth) //  Check if it is then bound by the width
    {
        scaleFactor = availableWidth / cWidth; //  Calculate the scale, and scale down
        console.log("Scale Factor W : " + scaleFactor); //  This ensures that we are always within the width
        cWidth = cWidth * scaleFactor; //  
        cHeight = cHeight * scaleFactor; //  
    }

    // Now we are both within the width and the height.

    console.log("Width : " + cWidth); //
    console.log("Height : " + cHeight); //
    console.log("Aspect Ratio : " + cWidth / cHeight); //

    canvas.attr({
        width: targetWidth, //  Target Width is 1920
        height: targetHeight // Target Height is 1080
    });

    canvas.css({
        width: "" + cWidth + "px", //  CSS Width is dependent on the browser.
        height: "" + cHeight + "px" //  CSS Height is dependent on the browser.
    });

    var offsetX = (canvasHolder.width() - cWidth) / 2 + canvasHolder.position().left; //
    var offsetY = (canvasHolder.height() - cHeight) / 2 + canvasHolder.position().top; //

    canvas.offset({
        left: offsetX, //
        top: offsetY //
    });

}

//  Initialize WebGL
function initializeWebGL() {
    try {
        canvasElement = document.getElementById("canvas"); //   Get the DOM Element
        gl = canvasElement.getContext("webgl"); //  Get the GL Context
        setGLViewport(); //  Set the GL Viewport
    } catch (e) {

    }

    if (!gl) {
        alert("Could not initialize WebGL"); // If it fails for some reason.
    };
}

function setGLViewport() {
    console.log(gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); //
}

function initializeProgram() {
    // Call your program from here.
    envLoad = new environmentLoad();
    tLoad = new teapotLoad();
    // Load all the resources before doing anything else.
    envLoad.loadResources();
    tLoad.loadResources();
    


}

var teapot_ready = false;
var env_ready = false;
// The Render Function
function render(newTimeStamp) {
    if(!env_ready || !teapot_ready) {
        return;
    }
    currentTimeStamp = newTimeStamp * 0.001;
    deltaTime = currentTimeStamp - previousTimeStamp;

    //  Call your program's render function here.
    envLoad.draw();
    tLoad.draw();
    window.requestAnimationFrame(render);
}