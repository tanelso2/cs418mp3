//-------------------------------------------------------------------------
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray, colorArray, textureArray)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(0);
           
           colorArray.push(0);
           colorArray.push(0);
           colorArray.push(1);
           colorArray.push(1);
           
           textureArray.push(deltaY*i/(maxY-minY));
           textureArray.push(deltaX*j/(maxX-minX));
           

       }

    var numT=0;
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    return numT;
}