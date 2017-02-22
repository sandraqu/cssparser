const uri = 'custom-font.css';

function urlExists( url ){
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	if( http.status !== 404 ) return true;

	console.error("Oh no, it does not exist!");
}

function getSelector(str){
	const rgx = /([^{]*)/;
	return [str.match(rgx)[0].trim(),str.replace(rgx,'').trim()];
}

function getDeclaration(str){
	const rgx = /([^{]*)/;
	return [str.match(rgx)[0],str.replace(rgx,'')];
}

function splitNClean(str){
	return str
	.split(',')
	.filter(sel => sel.length != 0)
	.map(sel => sel.trim());
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

	  let str = data.trim();
	  let ar = [];
	  let selector = '';
	  let media = '';
	  let mediaAr = [];
	  let deep = false;

	  /* progressive consumption of data */
	  // 
	  // get the selector
	  // if it has media, update mediaSelector and toggle
	  // set the array
	  // do the loop

	  //do {
		  [selector,str] = getSelector(str);
		  const endDeep = /^}/.test(selector);
		  //debugger;
		  if( endDeep ){
		  	// end of deep
		  	deep = !deep;
		  	str.replace(/^}/,'');
		  	[selector,str] = getSelector(str);
		  }

		  if( selector.includes('@media') ){
		  	deep = !deep;
		  	media = selector;
		  	str.replace(/^{/,'');
		  	[selector,str] = getSelector(str);
		  }

		  // split n clean selector
		  // build array
		 	const selectorAr = splitNClean(selector);
		 	// console.log(selectorAr);
		 	// debugger;

		 	// get declarations
		 	// split and clean
		 	// make array of declarations and selectors
		 	// loop again


		  if( deep ){
		  	// save to mediaAr
		  }

		//} while( str.length > 0 )
			

			// print to file
			//textbox.value = rebuiltStr;
		});

	})();

}