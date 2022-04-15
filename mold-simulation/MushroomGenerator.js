import "../deps/helpers.js"

import * as THREE from '../deps/three.js';
/*

build out L and I
figure out how to fan out the mushroom
coloring

rowpointslength is not calculated correctly is n>2
merge branches somehow

recalculate rowpointslength and weird row correctly to fix

additionally
use the cross product to extrude
add getpositionbyindex to object
safeguardsv f


*/

class MushroomGenerator {
    constructor() {
        //expects THREE.Vector3 as input
        // this.a = a;
        // this.b = b;
    }

    createMushroom(fourPoints, angle=0, numIter=1) {

        this.myFanPoints = {
            positions: [],
            indices: [],
            colors: [],
            //k represents the seed, and n represents the end
            nextRow: 'I',
            structure: '',
            currentIndex: 0
        };

        const normals = [];
        const colors = [];
        const indices = [];

        const pointA = fourPoints[0];
        const pointB = fourPoints[1];
        const pointC = fourPoints[2];
        const pointD = fourPoints[3];

        //initialize the first two points in the object
        this.myFanPoints.positions.push(pointA.x, pointA.y, pointA.z);
        this.myFanPoints.positions.push(pointB.x, pointB.y, pointB.z);
        this.myFanPoints.colors.push(1, 1, 1);
        this.myFanPoints.colors.push(1, 1, 1);

        //initialize the second two points in the object
        this.myFanPoints.positions.push(pointC.x, pointC.y, pointC.z);
        this.myFanPoints.positions.push(pointD.x, pointD.y, pointD.z);

        //create the first two faces
        this.myFanPoints.indices.push(0, 1, 3);
        this.myFanPoints.indices.push(0, 3, 2);
        this.myFanPoints.colors.push(1, 1, 1);
        this.myFanPoints.colors.push(1, 1, 1);

        console.log("before creating points" + this.myFanPoints.positions);
        console.log(this.myFanPoints.colors);

        this.createFanPoints(angle, numIter, this.myFanPoints);

        console.log("after creating points" + this.myFanPoints.indices);
        console.log("positions + " + this.myFanPoints.positions);
        console.log("indices" + this.myFanPoints.structure);

        const mushroomMesh = this.createMushroomMesh(this.myFanPoints);
       
        return mushroomMesh;
    }

    createFanPoints(angle, numIter, fanPoints) {

        console.log(numIter + "is the remaining rows");

        const currentRow = fanPoints.nextRow;
        // will always be the number of letters + the final vertex
        let rowPointsLength;
        // if(currentRow.length<4)   
        rowPointsLength = currentRow.length+1;
        // } else {
        //     //because of branching
        //     rowPointsLength = currentRow.length + 2;
        // }
        fanPoints.nextRow = '';
        let nextRowLength = 0;
        let weirdRowLength = rowPointsLength;



        if(numIter == 0) {
            //add the last faces on the far end of the mushroom
            //there is a forloop but no switch
            for(let i = 0; i<currentRow.length; i++) {

                fanPoints.indices.push(
                    fanPoints.currentIndex+1, 
                    fanPoints.currentIndex, 
                    fanPoints.currentIndex+rowPointsLength
                );

                //push(5,6,7);
                fanPoints.indices.push(
                    fanPoints.currentIndex+1, 
                    fanPoints.currentIndex+rowPointsLength,
                    fanPoints.currentIndex+rowPointsLength+1
                );

                fanPoints.currentIndex++;
            }

            return;
        }


        //create the first fan
        for(let i = 0; i<currentRow.length; i++) {

            //pull pointA
            const pointA = this.getPositionByIndex(fanPoints.currentIndex);
            //pull pointB
            const pointB = this.getPositionByIndex(fanPoints.currentIndex+1);

            //weird row!!
            // where I have to calculate the remaining length of the current row 
            // and add that to the length of the first bit of the next row
            if(i>0) {
                weirdRowLength = rowPointsLength-i+fanPoints.nextRow.length;
            } else {
                weirdRowLength = rowPointsLength;
            }


            switch(currentRow[i]) {
                case 'K':
                    // append new points
                    if(i<1) fanPoints.positions.push(pointA.x + 1, pointA.y, pointA.z);
                    fanPoints.positions.push(pointB.x + 1, pointB.y, pointB.z);


                    //counterclockwise indices
                    // fanPoints.indices.push(0, 4, 5)
                    //fanPoints.indices.push(0, 5, 1)
                    fanPoints.indices.push(
                        fanPoints.currentIndex, 
                        fanPoints.currentIndex+rowPointsLength+weirdRowLength, 
                        fanPoints.currentIndex+rowPointsLength+weirdRowLength+1
                        );
                    fanPoints.indices.push(
                        fanPoints.currentIndex, 
                        fanPoints.currentIndex+rowPointsLength+weirdRowLength+1,
                        fanPoints.currentIndex+1
                        );

                    if(i<1) fanPoints.colors.push(1, 1, 1);
                    fanPoints.colors.push(1, 1, 1);

                    fanPoints.nextRow += 'J';
                    //in units of vectices
                    nextRowLength = fanPoints.nextRow.length+1;
                    fanPoints.structure += 'K';
                    break;
                case 'J':
                    //calculate new point and push it
                    const newY = (pointB.y - pointA.y) /2;
                    if(i<1) fanPoints.positions.push(pointA.x + 1, newY, pointA.z );

            
                    fanPoints.indices.push(
                        fanPoints.currentIndex, //0
                        fanPoints.currentIndex+rowPointsLength*2, //4
                        fanPoints.currentIndex+1 //1
                    );

                    if(i<1) fanPoints.colors.push(1, 1, 1);
                    fanPoints.nextRow = '';
                    fanPoints.structure += 'J';
                    nextRowLength = fanPoints.nextRow.length+1;
                    break;
                case 'L':
                    const oneThird = (pointB.y - pointA.y)*0.33;
                    const twoThirds = (pointB.y - pointA.y) * 0.66;

                    if(i<1) fanPoints.positions.push(pointA.x + 1, pointA.y, pointA.z);
                    fanPoints.positions.push(pointA.x + 1,oneThird, pointA.z );
                    fanPoints.positions.push(pointA.x + 1, twoThirds, pointA.z);
                    fanPoints.positions.push(pointB.x + 1, pointB.y, pointB.z);

//generate the three triangles

                    //(0, 5, 4)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength
                    );
                    //(0, 1, 5)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + 1,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1
                    );
                    //(0, 6, 5)
                    fanPoints.indices.push(
                        fanPoints.currentIndex + 1,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength + 2,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1
                    );
                    //(1, 7, 6)
                    fanPoints.indices.push(
                        fanPoints.currentIndex+1,
                        fanPoints.currentIndex+ rowPointsLength+weirdRowLength+3,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength+2
                    )

                    if(i<1) fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);

                    fanPoints.nextRow = 'III';
                    fanPoints.structure += 'L';
                    nextRowLength = fanPoints.nextRow.length+1;
                    break;
                case 'I':
                    const midY = pointA.y + (pointB.y - pointA.y) /2 ;

                    //merge branches by not pushing the first point
                    if(i<1) fanPoints.positions.push(pointA.x + 1, pointA.y, pointA.z);
                    fanPoints.positions.push(pointA.x + 1, midY, pointA.z);
                    fanPoints.positions.push(pointB.x + 1, pointB.y, pointB.z);


                        //generate the three triangles

                        //(0, 5, 4)
                        fanPoints.indices.push(
                            fanPoints.currentIndex,
                            fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1,
                            fanPoints.currentIndex + rowPointsLength+weirdRowLength
                        );
                        //(0, 1, 5)
                        fanPoints.indices.push(
                            fanPoints.currentIndex,
                            fanPoints.currentIndex + 1,
                            fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1
                        );
                        //(0, 6, 5)
                        fanPoints.indices.push(
                            fanPoints.currentIndex + 1,
                            fanPoints.currentIndex + rowPointsLength+weirdRowLength + 2,
                            fanPoints.currentIndex + rowPointsLength+weirdRowLength + 1
                        );


                        fanPoints.colors.push(1,1,1);
                        fanPoints.colors.push(1,1,1);

                    if(i<1) {
                        fanPoints.colors.push(1,1,1);
                    }



                    fanPoints.nextRow += 'KK';
                    fanPoints.structure += 'I';
                    //should be equal to the amount of points pushed
                    nextRowLength = fanPoints.nextRow.length+1;

                    break;
                default:
                    break;

            }

            fanPoints.currentIndex++;
        }


        fanPoints.currentIndex++;

        // we should have an idea what the next row is going to
        // be therefore we'll know the length
        console.log(nextRowLength + "nextRow Length")
        console.log(rowPointsLength + "rowpointslength")
        //create the side face on the left side
        // no switch and no for loop
        // no positions either
        // at this point the index should be at the end of the first fan
        //push(2,6,4)
        fanPoints.indices.push(
            fanPoints.currentIndex,
            fanPoints.currentIndex+rowPointsLength+nextRowLength,
            fanPoints.currentIndex+rowPointsLength
        );
        //push(2,4,0)
        fanPoints.indices.push(
            fanPoints.currentIndex,
            fanPoints.currentIndex+rowPointsLength,
            fanPoints.currentIndex-rowPointsLength
        );
        // fanPoints.colors.push(1, 1, 1);
        // fanPoints.colors.push(1, 1, 1);

        let rowLengthTracker = 0;
        //create the second fan
        for(let i = 0; i<currentRow.length; i++) {

            //pull pointC
            const pointC = this.getPositionByIndex(fanPoints.currentIndex);
            //pull pointD
            const pointD = this.getPositionByIndex(fanPoints.currentIndex+1);

            if(i==1) {
                // weirdRowLength = rowPointsLength-i+fanPoints.nextRow.length;
                weirdRowLength = rowPointsLength-1+rowLengthTracker;
            } else {
                weirdRowLength = rowPointsLength;
            }


            switch(currentRow[i]) {
                case 'K':

                    // append new points
                    if(i<1) fanPoints.positions.push(pointC.x + 1, pointC.y, pointC.z);
                    fanPoints.positions.push(pointD.x + 1, pointD.y, pointD.z);


                    //counterclockwise indice
                    // fanPoints.indices.push(0, 5, 4)
                    //fanPoints.indices.push(0, 1, 5)
                    fanPoints.indices.push(
                        fanPoints.currentIndex, 
                        fanPoints.currentIndex+weirdRowLength+nextRowLength+1,
                        fanPoints.currentIndex+weirdRowLength+nextRowLength 
                        );
                    fanPoints.indices.push(
                        fanPoints.currentIndex, 
                        fanPoints.currentIndex+1,
                        fanPoints.currentIndex+weirdRowLength+nextRowLength+1
                        );

                    if(i<1) fanPoints.colors.push(1, 1, 1);
                    fanPoints.colors.push(1, 1, 1);

                    rowLengthTracker += 1;
                    break;
                case 'J':
                    // for this one we only create one point to make a triangular shape


                    //calculate new point and push it
                    const newY = (pointD.y - pointC.y) /2
                    fanPoints.positions.push(pointC.x + 1, newY, pointC.z);

                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex+1,
                        fanPoints.currentIndex+weirdRowLength+nextRowLength
                    );

                    fanPoints.colors.push(1, 1, 1);
                    break;
                case 'I':
                    const midY = pointC.y + (pointD.y - pointC.y) /2 ;

                    if(i<1) fanPoints.positions.push(pointC.x + 1, pointC.y, pointC.z);
                    fanPoints.positions.push(pointC.x + 1, midY, pointC.z);
                    fanPoints.positions.push(pointD.x + 1, pointD.y, pointD.z);

                    //generate the three triangles
                    //(2,7,8)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1
                    );
                    //(2,8,3)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1,
                        fanPoints.currentIndex + 1
                    );
                    //(3,8,9)
                    fanPoints.indices.push(
                        fanPoints.currentIndex + 1,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 2
                    );


                        if(i<1) fanPoints.colors.push(1,1,1);
                        fanPoints.colors.push(1,1,1);
                        fanPoints.colors.push(1,1,1);

                        rowLengthTracker += 2;
               case 'L':


                    //generate the three triangles
                    //(2,7,8)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1
                    );
                    //(2,8,3)
                    fanPoints.indices.push(
                        fanPoints.currentIndex,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1,
                        fanPoints.currentIndex + 1
                    );
                    //(3,8,9)
                    fanPoints.indices.push(
                        fanPoints.currentIndex + 1,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 1,
                        fanPoints.currentIndex + weirdRowLength+nextRowLength + 2
                    );
                    //(1, 7, 6)
                    fanPoints.indices.push(
                        fanPoints.currentIndex+1,
                        fanPoints.currentIndex + rowPointsLength+weirdRowLength+2,
                        fanPoints.currentIndex+ rowPointsLength+weirdRowLength+3
                    )


                    if(i<1) fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);
                    fanPoints.colors.push(1,1,1);

                    rowLengthTracker += 3;
                default:
                    break;

            }

            fanPoints.currentIndex++;
        }

        //current is 3
        //create the triangles for the right side
        fanPoints.indices.push(
            fanPoints.currentIndex-rowPointsLength, //1
            fanPoints.currentIndex+nextRowLength, //5
            fanPoints.currentIndex+nextRowLength*2 //7
        );
        fanPoints.indices.push(
            fanPoints.currentIndex-rowPointsLength,  //1
            fanPoints.currentIndex+nextRowLength*2, //7
            fanPoints.currentIndex //3
        );


        //indicating the end of a row
        fanPoints.structure += 'N';
        fanPoints.currentIndex++;


        this.createFanPoints(angle, numIter-1, fanPoints);
        // console.log(fanPoints.positions + "internal positions");
    }

    createMushroomMesh(upperFanPoints) {
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(upperFanPoints.indices);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( upperFanPoints.positions, 3 ));
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( upperFanPoints.colors, 3 ));
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial( {
            // color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            side: THREE.DoubleSide, vertexColors: true, transparent: true,
        } );

        const wires = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments( wires);
        line.material.depthTest = false;
        line.material.opacity = 0.9;
        line.material.transparent = true;

        const mesh = new THREE.Mesh( geometry, material );

        return line;
    }

    getPositionByIndex(index) {
        return new THREE.Vector3(
            this.myFanPoints.positions[index*3],
            this.myFanPoints.positions[index*3+1],
            this.myFanPoints.positions[index*3+2]
        );
    }

    ruleLookup(letter) {
        let numBranches = 0;
        switch(letter) {
            case 'K':
                numBranches = 1;
                break;
            case 'J':
                numBranches = 0;
                break;
            case 'L':
                numBranches = 3;
                break;
            case 'I':
                numBranches = 2;
                break;
            default:
                break;
        }
        return numBranches;
    }
}

export default MushroomGenerator;