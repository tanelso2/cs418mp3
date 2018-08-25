function environmentLoad() {
    this.RL = null; //  The Resource Loader
    this.shaderProgram = null; //  The Shader Program
}

environmentLoad.prototype.loadResources = function () {

    //  Request Resourcess
    this.RL = new ResourceLoader(this.resourcesLoaded, this);
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/environment_vertex_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/environment_fragment_shader.txt");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/british_isles.jpg")
    this.RL.loadRequestedResources();
};

environmentLoad.prototype.resourcesLoaded = function (environmentLoadReference) {
    // This will only run after the resouces have been loaded.
    environmentLoadReference.completeCheck();
    environmentLoadReference.begin();
};


environmentLoad.prototype.completeCheck = function () {
    //  Run a quick check
    console.log(this.RL.RLStorage.TEXT[0]);
    console.log(this.RL.RLStorage.TEXT[1]);
    console.log(this.RL.RLStorage.IMAGE[0]);

};

environmentLoad.prototype.begin = function () {
    // Begin running the program.  
    this.loadTerrain();
    this.initShaders();
    this.initPerspectiveBuffers(this.shaderProgram);
    this.initSetupBuffers();
    this.initTextures();

    //  Once everything has been finished call render from here.
    env_ready = true;
    render(0.0);
};

environmentLoad.prototype.initTextures = function() {
    this.environmentTexture = gl.createTexture();
    this.environmentTexture.image = this.RL.RLStorage.IMAGE[0];
    gl.bindTexture(gl.TEXTURE_2D, this.environmentTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.environmentTexture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


environmentLoad.prototype.initShaders = function () {

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

environmentLoad.prototype.createShader = function (shaderSource, shaderType) {
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

environmentLoad.prototype.initPerspectiveBuffers = function (shaderProgram) {
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
    if(this.theta === undefined) {
        this.theta = 0;
    }
    mat4.rotateZ(viewMatrix, viewMatrix, this.theta);
    this.theta = this.theta - 0.001;

    //  Get the perspective matrix location
    var pMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    //  Get the view matrix location
    var vMatrixUniform = gl.getUniformLocation(shaderProgram, "viewMatrix");

    var mMatrixUniform = gl.getUniformLocation(shaderProgram, "modelMatrix");


    //  Send the perspective matrix
    gl.uniformMatrix4fv(pMatrixUniform, false, cameraMatrix);
    //  Send the view matrix
    gl.uniformMatrix4fv(vMatrixUniform, false, viewMatrix);
    //  Send the model Matrix.
    gl.uniformMatrix4fv(mMatrixUniform, false, mMatrix);

}

environmentLoad.prototype.loadTerrain = function() {
    this.vTerrain=[];
    this.fTerrain=[];
    this.cTerrain=[];
    this.tTerrain=[];
    this.gridN=255;
    
    this.numT = terrainFromIteration(this.gridN, -20, 20, -20, 20, this.vTerrain, this.fTerrain, this.cTerrain, this.tTerrain);
}

environmentLoad.prototype.initSetupBuffers = function () {
    this.tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vTerrain), gl.STATIC_DRAW);
    this.tVertexPositionBuffer.itemSize = 3;
    this.tVertexPositionBuffer.numItems = (this.gridN+1)*(this.gridN+1);
    this.vertexPositionAttrib = gl.getAttribLocation(this.shaderProgram, "vertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tVertexPositionBuffer);
    gl.enableVertexAttribArray(this.vertexPositionAttrib); //  
    gl.vertexAttribPointer(this.vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // 
    
    this.shaderProgram.tVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexColorBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cTerrain), gl.STATIC_DRAW);
    this.shaderProgram.tVertexColorBuffer.itemSize = 4;
    this.shaderProgram.tVertexColorBuffer.numItems = (this.gridN+1)*(this.gridN+1);
    this.shaderProgram.vertexColorAttrib = gl.getAttribLocation(this.shaderProgram, "vertexColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.tVertexColorBuffer);
    gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttrib); //  
    gl.vertexAttribPointer(this.shaderProgram.vertexColorAttrib, 4, gl.FLOAT, false, 0, 0); // 
    
    this.shaderProgram.tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shaderProgram.tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fTerrain),
                  gl.STATIC_DRAW);
    this.shaderProgram.tIndexTriBuffer.itemSize = 1;
    this.shaderProgram.tIndexTriBuffer.numItems = this.numT*3;

    this.shaderProgram.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tTerrain), gl.STATIC_DRAW);
    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "textureCoord");
    gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
    gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
}


environmentLoad.prototype.draw = function () {
    //  Draw function - called from render in index.js
    gl.useProgram(this.shaderProgram);
    this.initSetupBuffers();
    this.initPerspectiveBuffers(this.shaderProgram);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); //  Set the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //  Clear the color as well as the depth buffer
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.environmentTexture);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uSampler"), 0);
    gl.drawElements(gl.TRIANGLES, this.shaderProgram.tIndexTriBuffer.numItems, gl.UNSIGNED_SHORT, 0); //  Draw
}