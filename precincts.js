var fs = require('fs');

var geojson = JSON.parse(fs.readFileSync('PolicePrecincts.geojson'));

// Converts from degrees to radians.
var radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
var degrees = function(radians) {
  return radians * 180 / Math.PI;
};

var center = function(geos){
	var x = 0;
	var y = 0;
	var z = 0;
	for(var i = 0; i<geos.length; i++){
		//console.log(geos[i]);
		x += Math.cos(radians(geos[i][0])) * Math.cos(radians(geos[i][1]));
		y += Math.cos(radians(geos[i][0])) * Math.sin(radians(geos[i][1]));
		z += Math.sin(radians(geos[i][0]));
	}
	x = x / geos.length;
	y = y / geos.length;
	z = z / geos.length;
	return [degrees(Math.atan2(y,x)),degrees(Math.atan2(z,Math.sqrt(x * x + y * y)))];
};
var gets = function(i){
var fin = []
var arr = geojson.features[i].geometry.coordinates;
for(var y = 0; y<arr.length; y++){
	for(var x = 0; x<arr[0].length; x++){
		for(var z = 0; z<arr[x][0].length; z++){
			if(arr[y][x][z] != undefined){
				fin.push(arr[y][x][z]);
			}
		}
	}
}
return fin;
};

var precinctCenter = function(pre){
	var f = geojson.features[pre].properties;
	var c = center(gets(pre));
	return [f.precinct,{
		'length': f.shape_leng,
		'area': f.shape_area,
		'center': c
	}];
}

var main = function(){
	var end = {};
	for(var i = 0; i<geojson.features.length; i++){
		var b = precinctCenter(i);
		end[b[0]] = b[1];
	}
	return end;
}

fs.writeFileSync('precincts.json',JSON.stringify(main()));