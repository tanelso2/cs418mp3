function teapotLoad() {
    this.RL = null; //  The Resource Loader
    this.shaderProgram = null; //  The Shader Program
}

teapotLoad.prototype.loadResources = function () {

    //  Request Resourcess
    this.RL = new ResourceLoader(this.resourcesLoaded, this);
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_vertex_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_fragment_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot.obj");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/negx.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/negy.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/negz.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/posx.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/posy.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/texturecube/posz.jpg");
    this.RL.loadRequestedResources();
};

teapotLoad.prototype.resourcesLoaded = function (teapotLoadReference) {
    // This will only run after the resouces have been loaded.
    teapotLoadReference.completeCheck();
    teapotLoadReference.begin();
};


teapotLoad.prototype.completeCheck = function () {
    //  Run a quick check
    console.log(this.RL.RLStorage.TEXT[0]);
    console.log(this.RL.RLStorage.TEXT[1]);
};

teapotLoad.prototype.begin = function () {
    // Begin running the program.  
    this.loadTeapot();
    this.initShaders();
    this.initPerspectiveBuffers(this.shaderProgram);
    this.initSetupBuffers();
    this.initTextCube();

    //  Once everything has been finished call render from here.
    teapot_ready = true;
    render(0.0);
};

teapotLoad.prototype.initShaders = function () {

    //  Initialize shaders - we're using that have been loaded in.
    var vertexShader = this.createShader(this.RL.RLStorage.TEXT[0], gl.VERTEX_SHADER); //  
    var fragmentShader = this.createShader(this.RL.RLStorage.TEXT[1], gl.FRAGMENT_SHADER); //  

    this.shaderProgram = gl.createProgram(); //  
    gl.attachShader(this.shaderProgram, vertexShader); //  
    gl.attachShader(this.shaderProgram, fragmentShader); //  
    gl.linkProgram(this.shaderProgram); //  

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) //  
    {
        alert("Unable to initialize the shader program."); //  
    }

    gl.useProgram(this.shaderProgram); //

};

teapotLoad.prototype.createShader = function (shaderSource, shaderType) {
    //  Create a shader, given the source and the type
    var shader = gl.createShader(shaderType); //  
    gl.shaderSource(shader, shaderSource); //  
    gl.compileShader(shader); //  

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) //  
    {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)); //
        return null; //
    }

    return shader; //
};

teapotLoad.prototype.initTextCube = function() {
    this.cubeTexture = gl.createTexture();
    this.cubeTexture.negx = this.RL.RLStorage.IMAGE[0];
    this.cubeTexture.negy = this.RL.RLStorage.IMAGE[1];
    this.cubeTexture.negz = this.RL.RLStorage.IMAGE[2];
    this.cubeTexture.posx = this.RL.RLStorage.IMAGE[3];
    this.cubeTexture.posy = this.RL.RLStorage.IMAGE[4];
    this.cubeTexture.posz = this.RL.RLStorage.IMAGE[5];
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeTexture);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.posx);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.posy);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.posz);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.negx);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.negy);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.cubeTexture.negz);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "texCube"), 0);
};

var theta = 0;
var tipping = 0;
var alpha = 0.0;
teapotLoad.prototype.initPerspectiveBuffers = function (shaderProgram) {
    //  Create the matrix
    var cameraMatrix = mat4.create();

    // Load it with a perspective matrix.
    mat4.perspective(cameraMatrix, Math.PI / 3, 16.0 / 9.0, 0.1, 60.0);

    //  Create a view matrix
    var viewMatrix = mat4.create();
    //  An identity view matrix
    mat4.identity(viewMatrix);

    var mMatrix = mat4.create();
    //  Set the view matrix - we are 20 units away from all the axes.
    mat4.lookAt(viewMatrix, vec3.fromValues(20, 20, 20), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1.0));
    mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(4, 4, 4));
    //mat4.rotateZ(viewMatrix, viewMatrix, theta);
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    /**
    if((tipping % (Math.PI / 2)) < Math.PI / 4) {
        mat4.rotateZ(viewMatrix, viewMatrix, tipping);
    } else {
        var tipBack = tipping % (Math.PI / 2);
        tipBack = (Math.PI / 4) - ((Math.PI / 2) + tipBack);
        mat4.rotateZ(viewMatrix, viewMatrix, tipBack);
    }
    */
    mat4.rotateZ(viewMatrix, viewMatrix,  0.5 * Math.sin(tipping));
    alpha += 0.001;
    tipping += 0.01;
    theta = theta + 0.01;
    
    var nMatrix = mat3.create();
    mat3.fromMat4(nMatrix, viewMatrix);
    mat3.transpose(nMatrix, nMatrix);
    mat3.invert(nMatrix, nMatrix);

    //  Get the perspective matrix location
    var pMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    //  Get the view matrix location
    var vMatrixUniform = gl.getUniformLocation(shaderProgram, "viewMatrix");

    var mMatrixUniform = gl.getUniformLocation(shaderProgram, "modelMatrix");
    
    var nMatrixUniform = gl.getUniformLocation(shaderProgram, "normalMatrix");


    //  Send the perspective matrix
    gl.uniformMatrix4fv(pMatrixUniform, false, cameraMatrix);
    //  Send the view matrix
    gl.uniformMatrix4fv(vMatrixUniform, false, viewMatrix);
    //  Send the model Matrix.
    gl.uniformMatrix4fv(mMatrixUniform, false, mMatrix);
    gl.uniformMatrix3fv(nMatrixUniform, false, nMatrix);

}

teapotLoad.prototype.loadTeapot = function() {
    this.vArray = [];
    this.fArray = [];
    var teapotString = this.RL.RLStorage.TEXT[2];
    var teapotLines = teapotString.split("\n");
    teapotLines.forEach(function(line) {
        var splitLine = line.split(" ");
        if(splitLine[0] === "v") {
            this.vArray.push(parseFloat(splitLine[1]));
            this.vArray.push(parseFloat(splitLine[2]));
            this.vArray.push(parseFloat(splitLine[3]));
        } else if(splitLine[0] === "f") {
            this.fArray.push(parseInt(splitLine[2])-1);
            this.fArray.push(parseInt(splitLine[3])-1);
            this.fArray.push(parseInt(splitLine[4])-1);
        }
    }.bind(this));
    this.createNormals();
}

teapotLoad.prototype.createNormals = function() {
    var tempNArray = [];
    for(var i = 0; i < this.vArray.length; i = i + 3) {
        tempNArray.push(vec3.fromValues(0.0, 0.0, 0.0));        
    }
    console.log(tempNArray.length);
    console.log(this.vArray.length);
    
    var grabPt = function(idx) {
        idx = idx * 3;
        return vec3.fromValues(this.vArray[idx], this.vArray[idx+1], this.vArray[idx+2]);
    }.bind(this);
    
    for(var i = 0; i < this.fArray.length; i = i + 3) {
        var i0 = this.fArray[i];
        var i1 = this.fArray[i+1];
        var i2 = this.fArray[i+2];
        var pt0 = grabPt(i0);
        var pt1 = grabPt(i1);
        var pt2 = grabPt(i2);
        var w = vec3.create();
        var v = vec3.create();
        vec3.sub(w, pt1, pt0);
        vec3.sub(v, pt2, pt0);
        vec3.cross(v, w, v);
        vec3.normalize(v, v);
        vec3.add(tempNArray[i0], tempNArray[i0], v);
        vec3.add(tempNArray[i1], tempNArray[i1], v);
        vec3.add(tempNArray[i2], tempNArray[i2], v);
    }
   
    this.nArray = [];
    var wrongCount = 0;
    tempNArray.forEach(function(n, idx) {
        vec3.normalize(n, n);
        var dirVec = grabPt(idx);
        if(vec3.dot(n, dirVec) <= 0.0) {
            wrongCount += 1;
        }
        this.nArray.push(n[0]);
        this.nArray.push(n[1]);
        this.nArray.push(n[2]);
    }.bind(this));
}

teapotLoad.prototype.initSetupBuffers = function () {

    this.shaderProgram.tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vArray), gl.STATIC_DRAW);
    this.shaderProgram.tVertexPositionBuffer.itemSize = 3;
    this.shaderProgram.tVertexPositionBuffer.numItems = this.vArray.length / 3;
    this.shaderProgram.vertexPositionAttrib = gl.getAttribLocation(this.shaderProgram, "vertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexPositionBuffer);
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttrib); //  
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // 
    
    this.shaderProgram.tVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexNormalBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nArray), gl.STATIC_DRAW);
    this.shaderProgram.tVertexNormalBuffer.itemSize = 3;
    this.shaderProgram.tVertexNormalBuffer.numItems = this.nArray.length / 3;
    this.shaderProgram.vertexNormalAttrib = gl.getAttribLocation(this.shaderProgram, "vertexNormal");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexNormalBuffer);
    gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttrib); //  
    gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0); // 
    
    this.shaderProgram.tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shaderProgram.tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fArray),
                  gl.STATIC_DRAW);
    this.shaderProgram.tIndexTriBuffer.itemSize = 1;
    this.shaderProgram.tIndexTriBuffer.numItems = this.fArray.length;

}

teapotLoad.prototype.draw = function () {
    //  Draw function - called from render in index.js
    gl.useProgram(this.shaderProgram);
    this.initSetupBuffers();
    this.initPerspectiveBuffers(this.shaderProgram);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); //  Set the clear color
    gl.enable(gl.DEPTH_TEST);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "texCube"), 0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //  Clear the color as well as the depth buffer
    gl.drawElements(gl.TRIANGLES, this.shaderProgram.tIndexTriBuffer.numItems, gl.UNSIGNED_SHORT, 0); //  Draw
}