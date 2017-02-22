const uri = 'basic.css';

function strToAr(data){
	const rgx = /([^{]*)({)([^}]*)(})/g;
	const res = rgx.test(data);

	if( res ) return data.match(rgx);
}

function stripReturns(ls){
	const res = ls.map(item => {
		return item.replace(/\r\n/g,'').replace(/[\r\n]/g,'');//.replace(/\s/g,'');
	});
	return res;
}

function toPairAr(ar){
	const res = ar.map(item => {
		const selRgx = /^"?([^{]*)/g;
		const decRgx = /({)([^}]+)(})/g;
		const selector = item.match(selRgx);
		const declaration = item.match(decRgx);
		// next up
		// remove the first {
		// remove the last }

		declaration[0] = declaration[0].replace(/{/,'').replace(/}/,'');
		return [selector, declaration];
	});

	return res;
}

function splitPairAr(ars){
	const res = ars.map((ar,dx) => {
		const selector = ar[0][0].split(',').filter(function(el) {return el.length != 0});
		const declaration = ar[1][0].split(';').filter(function(el) {return el.length != 0});
		const selTrimmed = selector.map(sel => {
			return sel.trim();
		});
		const decTrimmed = declaration.map(dec => {
			return (
				dec
				.replace(/:\s+/,':')
				.replace(/([0-9]+)(,)\s+/,function(str,val,comma){ return val+comma })
				.replace(/(,)\s+([0-9]+)/,function(str,comma,val){ return comma+val })
				.trim()
			);
		});
			
		return [selTrimmed, decTrimmed];
	});

	return res;
}

function urlExists( url ){
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	if( http.status !== 404 ) return true;

	console.error("Oh no, it does not exist!");
}

if( urlExists(uri)) { 

	(function () {
		const textbox = document.querySelector('#textbox');
		const create = document.querySelector('#create');
		let decAr = [];

		let textFile = null,
		makeTextFile = function (text) {
			const data = new Blob([text], {type: 'text/plain'});

			// If we are replacing a previously generated file we need to
			// manually revoke the object URL to avoid memory leaks.
			if (textFile !== null) {
				window.URL.revokeObjectURL(textFile);
			}

			textFile = window.URL.createObjectURL(data);

			return textFile;
		};

		create.addEventListener('click', function () {
			const link = document.createElement('a');
			link.setAttribute('download', 'info.txt');
			link.href = makeTextFile(textbox.value);
			document.body.appendChild(link);

			// wait for the link to be added to the document
			window.requestAnimationFrame(function () {
				const event = new MouseEvent('click');
				link.dispatchEvent(event);
				document.body.removeChild(link);
			});

		}, false);

	  fetch(uri)
	  .then(blob => blob.text())
	  .then(data => {

			const ar = strToAr(data);
			const cleanAr = stripReturns(ar);
			const selectorsAndDeclarationsPairAr = toPairAr(cleanAr);
			const splitSelectorsAndDeclarationsPairAr = splitPairAr(selectorsAndDeclarationsPairAr);
			
			// splitSelectorsAndDeclarationsPairAr
			// Array[5] <- parent ar
			// > Array[2] <- pairs
			// > > Array selectors: "[class^="svg-"]"
			// > > Array declarations: "font-size:36px"

			// build array
			splitSelectorsAndDeclarationsPairAr.map(ars => {
				
				// ars = [arr of selectors, arr of declarations]
				const selector = ars[0];
				const declaration = ars[1];
				
				// map each declaration to every selector
				const res = declaration.map((dec,idx) => {
				//
				// needs to fix this below 
				//
				decAr = decAr.filter(function(n){ return n != undefined }); 

					if( dec ) {
						const decYes = decAr.some(ress => {
							return ress.includes(dec);
						});

						if( !decYes){
							return [dec,[...selector]];
						}

						decAr.forEach((resss,idx) => {
							if( resss[0] === dec ){
								decAr[idx][1].push(...selector);
							}
						});
					}
					
				});
				
				decAr.push(...res);
			});
			
			// rebuild styles
			const rebuiltStr = decAr.map(ars => {
				// ars = [single declaration, arr of selectors]
				if( ars ) {
					const declaration = ars[0];
					const selector = ars[1];

					const addComma = selector.map(ar => {
						return ar;
					}).join(',');

					return `${addComma}{${declaration}}`;
				}

			}).join('');

			// print to file
			textbox.value = rebuiltStr;
		});

	})();

}