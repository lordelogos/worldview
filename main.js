
var docs;
class Card {
	constructor(obj){
		this.name = obj['name'];
		this.nativename = obj['nativeName'];
		this.population = obj['population'];
		this.region = obj['region'];
		this.subreg = obj['subregion'];
		this.capital = obj['capital'];
		this.currency = obj.currencies[0]['code'];
		this.currencyName = obj.currencies[0]['name']
		this.topdom = obj['topLevelDomain'];
		this.time = obj['timezones'];
		this.flag = obj['flag'];
	}

	displayCard(){
		return `
		<div class="resultCard">
			<img src="${this.flag}" class="flag">
			<div class="flagtext">
				<p class="resultName">${this.name}</p>
				<ul>
					<li>Population: ${this.population}</li>
					<li>Region: ${this.region}</li>
					<li>Capital: ${this.capital}</li>
				</ul>
			</div>
			

			<div class="resultview">
				<a href="${this.name}" class="pagelink">View More</a>
			</div>
		</div>
		`
	}

	mainPage(){
		return`
		<div class="resultPage">
			<img src="${this.flag}" class="flagpage">
			<div class="flagtextpage">
				<p class="pageName">${this.name}</p>
				<ul>
					<li>Native Name: ${this.nativename}</li>
					<li>Population: ${this.population}</li>
					<li>Region: ${this.region}</li>
					<li>SubRegion: ${this.subreg}</li>
					<li>Capital: ${this.capital}</li>
					<br>
					<br>
					<br>
					<li>Top Level Domain: ${this.topdom}</li>
					<li>Currency: ${this.currency}, ${this.currencyName}</li>
					<li>Timezone(s): ${this.time}</li>
				</ul>
			</div>
			<div class="back-btn">
				<p>MAIN PAGE</p>
			</div>
		</div>
		`
	}
}

var head = document.querySelector('#theme');
var theme = document.querySelector('input[type = "checkbox"]');
var selection = JSON.parse(localStorage.getItem('theme'));

if(selection){
	head.href = 'css/dark.css';
	theme.checked = true;
}

var toggle = document.querySelector('#themebtn');

toggle.addEventListener('change', () => {
	if (toggle.checked){
		head.href = 'css/dark.css';
		localStorage.setItem('theme', true)
	}else {
		head.href = 'css/light.css';
		localStorage.setItem('theme', false)
	}
});

//calls for pagination
var prev = document.querySelector('#prevbtn');
var next =document.querySelector('#nextbtn');
var currentpg = document.querySelector('#current');
var total = document.querySelector('#total');


//populating the page
var body = document.querySelector('#results');
var arr = JSON.parse(localStorage.getItem('results'));
var pagenum = 1;
var pagestotal;

if (arr == ''|| arr == null){
	(function() {
		var url = `https://restcountries.eu/rest/v2/all`;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function(){
			if(this.status == 200){
				var arr = JSON.parse(this.responseText);
				localStorage.setItem('results', JSON.stringify(arr));
				pagestotal = arr.length;
				docs = arr;
				document.getElementById("loader").style.display = "none";
				populate(docs, pagenum);
			}
		}

		xhr.send();
	})()
}else {
	docs = arr;
	document.getElementById("loader").style.display = "none";
	populate(docs, pagenum);
}



function populate(arr, pagenum){
	currentpg.textContent = pagenum
	body.innerHTML= '';
	document.querySelector('#pagination').style.visibility = 'visible';
	for (var i = 10*(pagenum- 1); i < pagenum * 10; i++){
		var obj = new Card(arr[i]);
		body.innerHTML += obj.displayCard();
	}
	loadpg();
}


//pagination
prev.addEventListener('click', function(){
	currentpg.textContent = parseInt(currentpg.textContent) -1;
	checkpg();
})

next.addEventListener('click', function(){
	currentpg.textContent = parseInt(currentpg.textContent) + 1;
	checkpg();
	
})

function checkpg(){
	pagenum = currentpg.textContent;
	if (parseInt(currentpg.textContent) == 1){
		prev.style.visibility = 'hidden';
		next.style.visibility = 'visible'
	}else if (parseInt(currentpg.textContent) == parseInt(total.textContent)){
		next.style.visibility = 'hidden';
		prev.style.visibility = 'visible'
	}else{
		next.style.visibility = 'visible';
		prev.style.visibility = 'visible'
	}
	populate(docs, pagenum);
}

//loading
//https://restcountries.eu/rest/v2/name/$name

function loadpg(){
	var links = document.querySelectorAll('.pagelink');
	Array.from(links).forEach( link => {
		link.addEventListener('click', function(e){
			e.preventDefault();
			var xhr = new XMLHttpRequest();
			var name = e.target.getAttribute('href');
			xhr.open('GET', `https://restcountries.eu/rest/v2/name/${name}`, true);
			xhr.onload = function(){
				if(this.status == 200){
					var arr = JSON.parse(this.responseText);
					var pg = new Card(arr[0]);
					document.querySelector('#pagination').style.visibility = 'hidden';
					prev.style.visibility = 'hidden';
					next.style.visibility = 'hidden';
					body.innerHTML= pg.mainPage();
					back2main();
				}
			}

			xhr.send();
		})
	})
}

function back2main(){
	var back = document.querySelector('.back-btn');
	back.addEventListener('click', function(){
		checkpg();
		populate(arr, pagenum);
	})
}

//search/filtering
var filter = document.querySelector('#continents');
var country = document.querySelector('#country');

//https://restcountries.eu/rest/v2/region/{region}

filter.addEventListener('change', function(){
	var reg = filter.value;
	var regex = JSON.parse(localStorage.getItem(`${reg}`));
	if (regex == ''|| regex == null){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://restcountries.eu/rest/v2/region/${reg}`, true);
		xhr.onload = function(){
				if(this.status == 200){
					var arr = JSON.parse(this.responseText);
					localStorage.setItem(`${reg}`, JSON.stringify(arr));
					var a = Math.floor(arr.length / 10);
					var b = arr.length % 10;
					if (b != 0){
						pagestotal = a + 1
					}else{
						pagestotal = a;
					}
					pagenum = 1
					total.textContent = pagestotal;
					docs = arr;
					prev.style.visibility = 'hidden';
					next.style.visibility = 'visible';
					populate(docs, pagenum);
				}
			}

			xhr.send();
		}else{
			var a = Math.floor(regex.length / 10);
			var b = regex.length % 10;
			if (b != 0){
				pagestotal = a + 1
			}else{
				pagestotal = a;
			}
			pagenum = 1
			total.textContent = pagestotal;
			docs = regex;
			prev.style.visibility = 'hidden';
			next.style.visibility = 'visible';
			populate(docs, pagenum)
		}
})


//search functionality https://restcountries.eu/rest/v2/name/{name}
country.addEventListener('keyup', function(e){
	if(e.which == '13'){
		var searchitem = country.value;
		console.log(searchitem);
		var xhr = new XMLHttpRequest();
		body.innerHTML= '';
		document.getElementById("loader").style.display = "block";
		xhr.open('GET', `https://restcountries.eu/rest/v2/name/${searchitem}`, true);
		xhr.onload = function(){
				if(this.status == 200){
					var arr = JSON.parse(this.responseText);
					country.value = '';
					document.getElementById("loader").style.display = "none";
					searchres(arr);
				}
			}
			xhr.send();
	}
})

function searchres(arr){
	body.innerHTML= '';
	document.querySelector('#pagination').style.visibility = 'hidden';
	prev.style.visibility = 'hidden';
	next.style.visibility = 'hidden';
	for (let i in arr){
		var obj = new Card(arr[i]);
		body.innerHTML += obj.displayCard();
	}

	loadpg();
}
