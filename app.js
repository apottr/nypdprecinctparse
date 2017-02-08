"use strict";
var pdfText = require('pdf-text');
var fs = require('fs');
var request = require('request');
var colLength = 12;
var crimes = {
	'murder': {'name': 'Murder', 'penal': 'A-1', 'classification': 'FELONY', 'number': 37},
	'rape': {'name': 'Rape', 'penal': ['E','D','B'], 'classification': 'FELONY', 'number': 50},
	'robbery': {'name': 'Robbery', 'penal': ['D','C','B'], 'classification': 'FELONY', 'number': 63},
	'felAssault': {'name': 'Felonious Assault', 'penal': ['D','B'], 'classification': 'FELONY', 'number': 76},
	'burglary': {'name': 'Burglary', 'penal': ['D','C','B'], 'classification': 'FELONY', 'number': 89},
	'grandLarceny': {'name': 'Grand Larceny', 'penal': ['E','D','C','B'], 'classification': 'FELONY', 'number': 102},
	'grandLarcenyAuto': {'name': 'Grand Larceny Auto', 'penal': '', 'classification': 'FELONY', 'number': 115},
	'transit': {'name': 'Transit', 'penal': '', 'classification': '', 'number': 141},
	'housing': {'name': 'Housing', 'penal': '', 'classification': '', 'number': 154},
	'petitLarceny': {'name': 'Petit Larceny', 'penal': 'A', 'classification': 'MISDEMEANOR', 'number': 167},
	'misdAssault': {'name': 'Misdemeanor Assault', 'penal': 'A', 'classification': 'MISDEMEANOR', 'number': 180},
	'misdSexCrimes': {'name': 'Misdemeanor Sex Crimes', 'penal': ['A','B'], 'classification': 'MISDEMEANOR', 'number': 193},
	'shootingVic': {'name': 'Shooting with Victim', 'penal': ['C','D'], 'classification': 'FELONY', 'number': 206},
	'shootingInc': {'name': 'Shooting Incident', 'penal': ['C','D'], 'classification': 'FELONY', 'number': 219}
};
var crimesList = [
	'murder',
	'rape',
	'robbery',
	'felAssault',
	'burglary',
	'grandLarceny',
	'grandLarcenyAuto',
	'transit',
	'housing',
	'petitLarceny',
	'misdAssault',
	'misdSexCrimes',
	'shootingVic',
	'shootingInc'
];
var precincts = JSON.parse(fs.readFileSync('precincts.json'));
var functions = {
	week: {
		getData: function(chunks,crime){
			var p = chunks[11].substr(0,3).replace(/[A-z]*$/,'');
			var a = {
				'precinct': p,
				'crime': crimes[crime],
				'week': {
					'2016': chunks[crimes[crime].number+1],
					'2015': chunks[crimes[crime].number+2],
					'change': chunks[crimes[crime].number+3]
				},
				'28day': {
					'2016': chunks[crimes[crime].number+4],
					'2015': chunks[crimes[crime].number+5],
					'change': chunks[crimes[crime].number+6]
				},
				'year': {
					'2016': chunks[crimes[crime].number+7],
					'2015': chunks[crimes[crime].number+8],
					'change': chunks[crimes[crime].number+9]
				},
				'2year': {
					'change': chunks[crimes[crime].number+10]
				},
				'6year': {
					'change': chunks[crimes[crime].number+11]
				},
				'23year': {
					'change': chunks[crimes[crime].number+12]
				}
			}
			return a;
		}
	},
	historical: {
		getData: function(chunks,crime){

		}
	}
};


var parse = function(url,callback){
	request({url: url, encoding: null},function(err,response,body){
		if(err) throw err;
		pdfText(body,function(er,chunks){
			if(er) throw JSON.stringify(er);
			if(chunks.length == 342 || chunks.length == 343){
				callback(chunks);
			}
		})
	});
};

var processAll = function(chunks,callback){
	var x = {};
	for(var i = 0; i<crimesList.length; i++){
		x[crimesList[i]] = functions.week.getData(chunks,crimesList[i]);
		if(x['shootingInc']){
			callback(x);
		}
	}
};

var main = function(){
	var urls = ['001','010','100','101','102',
				'103','104','105','106','107',
				'108','109','110','111','112',
				'113','114','115','120','121',
				'122','123','013','017','019',
				'020','023','024','025','026',
				'028','030','032','033','034',
				'040','041','042','043','044',
				'045','046','047','048','049',
				'005','050','052','006','060',
				'061','062','063','066','067',
				'068','069','007','070','071',
				'072','073','075','076','077',
				'078','079','081','083','084',
				'088','009','090','094'];
	var base = 'http://www.nyc.gov/html/nypd/downloads/pdf/crime_statistics/cs-en-us-';
	var after = 'pct.pdf';
	var j = 0;
	console.log(urls.length);
	for(let j = 0; j<urls.length; j++){
		parse(base+urls[j]+after,function(chunks){
			//console.log(chunks[11]);
			processAll(chunks,function(end){
				fs.writeFileSync('precincts/'+urls[j]+'.json',JSON.stringify(end,null,2));
			});
		});
	}
};
main();