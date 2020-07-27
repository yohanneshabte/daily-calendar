/* NW.js */

/* var ngui = require("nw.gui");
var nwin = ngui.Window.get();
nwin.enterFullscreen();

document.addEventListener("keydown", function(event) {
	const key = event.key; // Or const {key} = event; in ES6+
	if (key === "Escape") {
		nw.App.quit();
	}
}); */
/*$(document).ready(function() {
	$('.mytooltip').tooltipster();
	$('[data-toggle="popover"]').tooltip();
}); */

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

var sideBar = new SideBar();

$(function () {
	$('[data-toggle="popover"]').popover(); 
});

$('.arcs').on("click", function (e) {
	console.log(e.relatedTarget.nextSibling.textContent);
	$('#detailModalLabel').html(e.relatedTarget.nextSibling.textContent);
	//$(".modal-backdrop.in").hide();
});


const shortHour = hour => (hour > 12 ? hour - 12 : hour === 0 ? 12 : hour);
const longHour = (hour, ampm) => (hour==12 && ampm == 'AM' ? 0 : hour==12 ? 12 : ampm == 'AM' ? hour : ampm == 'PM' ? 12 + hour : hour);
$('#switchAnalog').change(function() {
	if($(this).prop('checked')) 
		transformTime('analog', true);
	else
		transformTime('analog', false);
});
$('#switchDigital').change(function() {
	if($(this).prop('checked')) 
		transformTime('digital', true);
	else
		transformTime('digital', false);
});

// function to transform time format
function transformTime(type, checked) {
	if(type=="digital") {
		var hourMin = $('.time').text().trim().split(':');
		if(checked == true) {
			//turn to 24
			
			var ampm1 = hourMin[1].substring(hourMin[1].length-3,hourMin[1].length).trim();
			var hourLong = longHour(parseInt(hourMin[0]),ampm1);
			var modified = hourLong + $('.time').text().trim().substring(1, $('.time').text().trim().length-2);
			$('.time').html(modified);
		} else {
			//turn to 12
			var hourShort = shortHour(hourMin[0]);
			console.log(hourShort);
			var modified = hourShort + $('.time').text().trim().substring(1, $('.time').text().trim().length) + "<span class='meridiem'> $" +
				hourMin[0] >= 12 ? "PM" : "AM"
			+"}</span>";
			//setInterval(() => setDigital('24'), 500);
			console.log(modified)
			$('.time').html(modified);
			
		}
	} else {
		if(checked == true) {
			//turn to 24
			$('.hour-box').each(function(i) {
				if(i==12)
					$(this).children('div').text(0);
				else if(i<13)
					$(this).children('div').text(12+i);
				else
					$(this).children('div').text(i-12);
				var transformVal = 360/24*i*-1;
				$(this).children('div').css("transform", "rotate("+ transformVal +"deg)");
			})
		} else {
			//turn to 12
			$('.hour-box').each(function(i) {
				if(i==0)
				 	$(this).children('div').text(12);
				else if(i>12)
					$(this).children('div').text(i-12);
				else
					$(this).children('div').text(i);	
				var transformVal = 360/24*i*-1;
				$(this).children('div').css("transform", "rotate("+ transformVal +"deg)");
			})
		}
	}
}
// ############################################################


//check if local storage has data
if(localStorage.getItem("daily") !== undefined) {
	// document.getElementById("choose").style.display = "none";
	// document.getElementById("clock").style.display = "flex";
	// read("nth");
}
// Data
var JsonCalData = "";
var AllEvents = [];
var AllEvents1 = [];
function readFile(file) {
	return new Promise((resolve, reject) => {
	  let fr = new FileReader();
	  fr.onload = x=> resolve(fr.result);
	  fr.readAsText(file);
})}

async function read(input) {
	var daily = [];
	if(input != 'nth')
		localStorage.clear();

	if(localStorage.getItem("daily") === undefined || localStorage.getItem("daily") === null) {
		var iCal = [], JsonCalData = [];
		console.log("Num of Files: " + input.files.length);
		for(var i=0;i<input.files.length;i++) {
			iCal.push();
			JsonCalData.push();
			iCal[i] = await readFile(input.files[i]);
			JsonCalData[i] = ICAL.parse(iCal[i]);
		}
		
		document.getElementById("choose").style.display = "none";
		document.getElementById("clock").style.display = "flex";

		for(var j=0; j<JsonCalData.length;j++) {
			AllEvents.push([]);
			for(var i=0;i<JsonCalData[j][2].length;i++) {
				if(JsonCalData[j][2][i][0] == "vevent") {	
					AllEvents[j].push(JsonCalData[j][2][i]);
				}
			}
		}
		for(var j=0; j<AllEvents.length;j++)	
			for(var i=0;i<AllEvents[j].length;i++) {
				// clean up events array
				AllEvents[j][i] = AllEvents[j][i][1];
			}
		for(var i=0;i<AllEvents.length;i++) {	
			AllEvents1[i] = calToArray(AllEvents[i]);
			AllEvents1[i] = simplify(AllEvents1[i]);

		} 
		console.log(AllEvents1);
		for(var i=0; i<AllEvents1.length;i++) {
			AllEvents1[i]['color'] = Util.getRandomColor();
			var temp = getSchedule(AllEvents1[i], "SU", AllEvents1[i]['color']);
			daily = [...daily, ...temp];
		}
		localStorage.setItem("daily", JSON.stringify(daily));
	} else {
		document.getElementById("choose").style.display = "none";
		document.getElementById("clock").style.display = "flex";
		daily = JSON.parse(localStorage.getItem("daily"));
	}
	console.log(daily);

	daily = daily.sort((a, b) => {
		return timeToAngle(a[1]) > timeToAngle(b[1]) ? 1 : -1;
	});
	// show all sidebar items
	sideBar.populateSidebar(daily);
	daily = freeTimeAdd(daily);
	console.log(daily);



	routine['everyday'] = daily;
	var calendar = new Calendar();

	calendar.draw();
}
function getSchedule(cal, dayOfWeek, color) {
	var day = [], j = 0;
	for(var i=0;i<cal.length;i++) {	
		if(cal[i]['recur'] != null && cal[i]['recur']['freq'] != null) {
			// get daily events first
			if(cal[i]['recur']['freq'] == 'DAILY') {
				day.push([]);
				var start = cal[i]['start'].getHours()+ ":" + (cal[i]['start'].getMinutes()<10?'0':'') + cal[i]['start'].getMinutes();
				var end = cal[i]['end'].getHours()+ ":" + (cal[i]['end'].getMinutes()<10?'0':'') + cal[i]['end'].getMinutes();
				day[j][0] = cal[i]['title'];
				day[j][1] = start;
				day[j][2] = end;
				day[j][3] = color;
				j++;
			}
			//weekly recurring events
			if(cal[i]['recur']['freq'] == 'WEEKLY') {
				if(cal[i]['recur']['byday'] != null && cal[i]['recur']['byday'].includes(dayOfWeek)) {
					day.push([]);
					var start = cal[i]['start'].getHours()+ ":" + (cal[i]['start'].getMinutes()<10?'0':'') + cal[i]['start'].getMinutes();
					var end = cal[i]['end'].getHours()+ ":" + (cal[i]['end'].getMinutes()<10?'0':'') + cal[i]['end'].getMinutes();
					day[j][0] = cal[i]['title'];
					day[j][1] = start;
					day[j][2] = end;
					day[j][3] = color;
					j++;
				} else {
					//only once a week
					//find out day
					if(dayOfWeek == days[cal[i]['start'].getDay()].slice(0,2).toUpperCase()) {
						day.push([]);
						var start = cal[i]['start'].getHours()+ ":" + (cal[i]['start'].getMinutes()<10?'0':'') + cal[i]['start'].getMinutes();
						var end = cal[i]['end'].getHours()+ ":" + (cal[i]['end'].getMinutes()<10?'0':'') + cal[i]['end'].getMinutes();
						day[j][0] = cal[i]['title'];
						day[j][1] = start;
						day[j][2] = end;
						day[j][3] = color;
						j++;
					}
				}
			}
		}
	}
	
	

	//
	return day;
}


function freeTimeAdd(input) {
	//var placeholder = ["Free", "0:00", "23:59", "grey"];
	var free = [];
	for(var i=0; i<input.length; i++) {
		if(i != input.length-1) {
			if(input[i][2] != input[i+1][1])
				free.push(["Free", input[i][2], input[i+1][1], "gray"]);
		}
		else {
			if(input[i][2] != input[0][1])
				free.push(["Free", input[i][2], input[0][1], "gray"]);
		}
	}

	return [...input, ...free];
}

function fillFreeTime(input) {
	var time = [];
	var placeholder = "Free";
	for(var i=0; i<input.length;i++) {
		var timeValue = [...input[i][1].split(":"), ...input[i][2].split(":")];
		time.push(parseInt(timeValue[0])*60+parseInt(timeValue[1]));
		time.push(parseInt(timeValue[2])*60+parseInt(timeValue[3]));
	}
	//time.sort((a, b) => a - b);
	console.log(time);
	var init = "0:00";
	for(var i=0; i<time.length; i+=2) {
		var final = [Math.floor(time[i]/60), Util.pad(time[i]%60, 2)];
		final[1] = Util.pad(final[1],2);
		console.log(final[1]);
		var finalstring = final.join(":")
		input.push([placeholder, init, finalstring, "green"]);
		init = [Math.floor(time[i+1]/60), Util.pad(time[i+1]%60, 2)].join(":");
		console.log(init);
	}

	/*for(var i=0; i<input.length; i++) {
		if(input[i] == "Free") {
			var overlappingFree = false;

			for(var j=0; j<input.length; j++) {
				if(input[j] != "Free") {
					

				}
			}

		}
	} */
	console.log(input);
	return input;
} 

function calToArray(input) {
	output = [];
	for(var i=0;i<input.length;i++) {
		output.push([]);
		for(var j=0;j<input[i].length;j++) {
			switch(input[i][j][0]) {
				case "summary":
					output[i]['title'] = input[i][j][3];
					break;
				case "dtend":
					output[i]['end'] = new Date(input[i][j][3]);
					break;
				case "dtstart":
					output[i]['start'] = new Date(input[i][j][3]);
					break;
				case "rrule":
					output[i]['recur'] = input[i][j][3];
					break;
			}
		}
	}
	return output;
}

function simplify(input) {
	var today = new Date().getTime();
	//simplify calendar by removing past and non recurring events
	for(var i=0; i<input.length; i++) {
		if(input[i]['recur'] == null) {
			// all day events
			if(input[i]['end'] == null && input[i]['start'].getTime()<=today) {
				input.splice(i,1);
				i--;
				continue;
			}
			if(input[i]['end'].getTime()<=today) {
				input.splice(i,1);
				i--;
				continue;
			}
		} else {
			// remove recur events that ended
			if(input[i]['recur']['until'] != null) {
				var repeatEnd = new Date(input[i]['recur']['until']);
				if(repeatEnd.getTime()<=today) {
					input.splice(i,1);
					i--;
					continue;
				}
			}
		}

	}
	return input;
}


const routine = {
	sundays: [
		// ["Clean house", "8:00", "10:00", "turquoise"],
		// ["Check priorities & progress", "10:30", "12:00", "orange"],
		// ["Write (weekly journal)", "13:00", "15:00", "#7B7B7B"],
		// ["News digest / recreation", "15:30", "18:30", "#FFC000"],
		// ["Light exercise", "18:30", "19:00", "palegreen"]
	],
	mondays: [],
	tuesdays: [],
	wednesdays: [],//["Testing", "8:00", "10:00", "#1B70E7"],
	thursdays: [
		// ["Write", "6:00", "7:00", "#7B7B7B"],
		// ["Weight, posture, stretches", "7:00", "7:30", "green"],
		// ["Breakfast", "7:30", "8:00", "#C00000"],
		// ["Break", "10:00", "10:30", "#FFC000"],
		// ["Lunch", "12:00", "12:30", "#C00000"],
		// ["Nap", "12:30", "13:00", "#6A5125"],
		// ["Working", "13:00", "15:00", "#1B0BE0"],
		// ["Tea time", "15:00", "15:30", "#C00000"],
		// ["Shower", "19:00", "19:30", "#00B0F0"],
		// ["Dinner", "19:30", "20:00", "#C00000"],
		// ["Read/Write", "20:00", "21:00", "#7B7B7B"],
		// ["Meditation", "21:00", "22:00", "#7030A0"],
		// ["Sleep", "22:00", "6:00", "#6A5125"]
	],
	fridays: [],
	saturdays: [
		// ["Work", "8:00", "10:00", "#1B7BE7"],
		// ["Work", "10:30", "12:00", "#1B7BE7"],
		// ["Work", "13:00", "15:00", "#1B7BE7"],
		// ["Work", "15:30", "17:30", "#1B7BE7"],
		// ["Break", "17:30", "18:00", "#FFC000"],
		// ["Exercise", "18:00", "19:00", "green"]
	],
	everyday: [],
	// everyday: [
	// 	["Write", "6:00", "7:00", "#7B7B7B"],
	// 	["Weight, posture, stretches", "7:00", "7:30", "green"],
	// 	["Breakfast", "7:30", "8:00", "#C00000"],
	// 	["Break", "10:00", "10:30", "#FFC000"],
	// 	["Lunch", "12:00", "12:30", "#C00000"],
	// 	["Nap", "12:30", "13:00", "#6A5125"],
	// 	["Working", "13:00", "15:00", "#1B0BE0"],
	// 	["Tea time", "15:00", "15:30", "#C00000"],
	// 	["Shower", "19:00", "19:30", "#00B0F0"],
	// 	["Dinner", "19:30", "20:00", "#C00000"],
	// 	["Read/Write", "20:00", "21:00", "#7B7B7B"],
	// 	["Meditation", "21:00", "22:00", "#7030A0"],
	// 	["Sleep", "22:00", "6:00", "#6A5125"]
	// ],
	weekends: [],
	weekdays: [],
		// ["Work", "8:00", "10:00", "#1B7BE7"],
		// ["Work", "10:30", "12:00", "#1B7BE7"],
		// ["Work", "13:00", "15:00", "#1B0BEF"],
		// ["Work", "15:30", "17:30", "#1B7BE7"],
		// ["Break", "17:30", "18:00", "#FFC000"],
		// ["Exercise", "18:00", "19:00", "green"]
	//]
};

const sun = {
	sunrise: "5:30",
	sunset: "18:50"
};

// ############################################################
/* SVG Arc */
// Draw arcs

function timeToAngle(time) {
	const hrMin = time.split(":");
	const hourAngle = (hrMin[0] / 24) * 360;
	const minutesAngle = ((360 / 24) * hrMin[1]) / 60;
	return hourAngle + minutesAngle;
}

//console.log(timeToAngle("18:00"));

for (let i = 0; i < routine.everyday.length; i++) {
	const label = routine.everyday[i][0];
	const startAngle = timeToAngle(routine.everyday[i][1]);
	const endAngle = timeToAngle(routine.everyday[i][2]);
	const color = routine.everyday[i][3];

	console.log(label, startAngle, endAngle, color);
}
class Calendar {
 draw() {
	const arrayToDraw = [];

	arrayToDraw.push(routine["everyday"]);

	let day = "";

	var today = new Date().getDay();

	switch (today) {
		case 0:
			day = "sundays";
			break;
		case 1:
			day = "mondays";
			break;
		case 2:
			day = "tuesdays";
			break;
		case 3:
			day = "wednesdays";
			break;
		case 4:
			day = "thursdays";
			break;
		case 5:
			day = "fridays";
			break;
		case 6:
			day = "saturdays";
			break;
	}

	for (let key of Object.keys(routine)) {
		if (routine[key].length !== 0 && key === day) {
			arrayToDraw.push(routine[key]);
		}

		if (routine["weekdays"].length !== 0 && key === day) {
			if (
				today === 1 ||
				today === 2 ||
				today === 3 ||
				today === 4 ||
				today === 5
			) {
				arrayToDraw.push(routine["weekdays"]);
			}
		}

		if (routine["weekends"].length !== 0 && key === day) {
			if (today === 0 || today === 6) {
				arrayToDraw.push(routine["weekends"]);
			}
		}
	}

	let toPlot = [];

	for (let i = 0; i < arrayToDraw.length; i++) {
		toPlot = toPlot.concat(arrayToDraw[i]);
	}

	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians)
		};
	}
	const arcProp = {
		cx: 200, // <-- center x
		cy: 200, // <-- center y
		radius: 180 // <-- circle radius
	};

	// arc = {
	// 	start_angle: 15, // <-- start angle in degrees
	// 	end_angle: 90 // <-- end angle in degrees
	// };

	document
		.getElementById("svg")
		.removeChild(document.getElementById("svg").childNodes[3]);

	function appendG() {
		document
			.getElementById("svg")
			.removeChild(document.getElementById("svg").childNodes[3]);

		const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		
		// show all sidebar items
		//populateSidebar(toPlot);
		
		for (let i = 0; i < toPlot.length; i++) {
			const label = toPlot[i][0];
			const startAngle = timeToAngle(toPlot[i][1]);
			const endAngle = timeToAngle(toPlot[i][2]);
			const color = toPlot[i][3];
			console.log(label + startAngle);
			const start = polarToCartesian(
				arcProp.cx,
				arcProp.cy,
				arcProp.radius,
				startAngle
			);
			const end = polarToCartesian(
				arcProp.cx,
				arcProp.cy,
				arcProp.radius,
				endAngle
			);

			var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

			let d = [
				"M",
				start.x,
				start.y,
				"A",
				arcProp.radius,
				arcProp.radius,
				0,
				largeArcFlag,
				1,
				end.x,
				end.y
			].join(" ");

			// console.log(label, startAngle, endAngle, color);
			const path = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path"
			);
			const title = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"title"
			);
			const text = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"text"
			);
			const textPath = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"textPath"
			);
			const tspan = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"tspan"
			);
			
			textPath.setAttributeNS(
				"http://www.w3.org/1999/xlink",
				"xlink:href",
				`#arc${i}`
			);

			
			textPath.setAttribute("fill", color);
			var tspanText = document.createTextNode(label);
			tspan.appendChild(tspanText);
			textPath.appendChild(tspan);
			text.appendChild(textPath);
				
			path.setAttribute("id", `arc${i}`);
			path.setAttribute("class","arcs mytooltip");
			//path.setAttribute("title","This is my span's tooltip message!");
			
			//path.setAttribute("data-backdrop","false");
			path.setAttribute("data-toggle","collapse");
			path.setAttribute("data-target",`#collapse${i}`)
			path.setAttribute("stroke", color);
			path.setAttribute("onclick", `sideBar.openSidebar(${i})`);
			path.setAttribute("d", d);
			
			g.appendChild(path);
			g.appendChild(text);
			$('.arcs').tooltip({title:'some title', container:'body'});
			// document.getElementById("arc1").setAttribute("d", d);
			
			//$('#detailModalLabel').html(toPlot[i][0]);
			
			//document.getElementById("detailModalLabel").innerHTML = "test";
		}

		document.getElementById("svg").appendChild(g);
		
	}

	setInterval(appendG, 1800000);

	appendG();

	// ############################################################
	/* Digital and Hand */

	//console.log(toPlot);

	//toPlot = freeTimeAdd(toPlot);

	var sortedToPlot = toPlot.sort((a, b) => {
		return timeToAngle(a[1]) > timeToAngle(b[1]) ? 1 : -1;
	});
	console.log("To plot:");
	
	console.log(sortedToPlot);



	const hand = document.querySelector(".hand");
	const digital = document.querySelector(".digital");
	const time = document.querySelector(".time");
	const meridiem = document.querySelector(".meridiem");
	const task = document.querySelector(".task");

	function setDigital(format = '12') {
		const now = new Date();
		var hour = now.getHours();
		const minutes = now.getMinutes();
		const minFull = minutes => (minutes < 10 ? `0${minutes}` : minutes);
		const handDegrees = (360 / 24) * hour + (360 / 1440) * minutes;
		hand.style.transform = `rotate(${handDegrees}deg)`;

		let currentTask = "";
		let taskColor = "";
		let stop = 0;

		for (let i = 0; i < sortedToPlot.length; i++) {
			if (
				timeToAngle(sortedToPlot[i][1]) <=
					timeToAngle(`${hour}:${minFull(minutes)}`)  /* &&
				timeToAngle(`${hour}:${minFull(minutes)}`) - 180 <
					timeToAngle(sortedToPlot[i][2]) */ &&
				stop !== 1
			) 
			{
				currentTask = sortedToPlot[i][0];
				taskColor = sortedToPlot[i][3];
			}
			 else {
				stop = 1;
			}

			// my code
			//currentTask = sortedToPlot[i][0];
			//taskColor = sortedToPlot[i][3];
		}
		digital.innerHTML = "";
		const time = document.createElement("div");
		if(format == '12') {
			time.innerHTML = `
				<div class="time">
					${shortHour(hour)}<span class="separator">:</span>${minFull(minutes)}<span class="meridiem"> ${
				hour >= 12 ? "PM" : "AM"
			}</span>
				</div>
				<div class="task" style="color:${taskColor}">${currentTask}</div> 
			`; // TODO
		}
		else if(format == '24') {
			hour = Util.pad(hour, 2);
			time.innerHTML = `
			<div class="time">
				${hour}<span class="separator">:</span>${minFull(minutes)}
			</div>
			<div class="task" style="color:${taskColor}">${currentTask}</div> 
		`; // TODO
			console.log(hour + ":" + minFull(minutes))
		}
		digital.appendChild(time);

		//console.log(`${hour}:${minutes} ${currentTask}`);
	}

	setInterval(setDigital, 1000);

	setDigital();

	// ############################################################
	/* Calendar */
	// From here: https://www.cssscript.com/filterable-calendar-vanilla/

	let myCalendar = new VanillaCalendar({
		selector: "#myCalendar",
		pastDates: true,
		shortWeekday: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
	});
}
}