/*! version parser.0.3 */
function strToAr(data) {
    const rgx = /([^{]*)({)([^}]*)(})/g;
    const res = rgx.test(data);

    if (res) return data.match(rgx);
}

function stripReturns(ls) {
    const res = ls.map(item => {
        return item.replace(/\r\n/g, '').replace(/[\r\n]/g, ''); //.replace(/\s/g,'');
    });
    return res;
}

function toPairAr(ar) {
    const res = ar.map(item => {
        const selRgx = /^"?([^{]*)/g;
        const decRgx = /({)([^}]+)(})/g;
        const selector = item.match(selRgx);
        const declaration = item.match(decRgx);
        // next up
        // remove the first {
        // remove the last }

        declaration[0] = declaration[0].replace(/{/, '').replace(/}/, '');
        return [selector, declaration];
    });

    return res;
}

function splitPairAr(ars) {
    const res = ars.map((ar, dx) => {
        const selector = ar[0][0].split(',').filter(function(el) { return el.length != 0 });
        const declaration = ar[1][0].split(';').filter(function(el) { return el.length != 0 });
        const selTrimmed = selector.map(sel => {
            return sel.trim();
        });
        const decTrimmed = declaration.map(dec => {
            return (
                dec
                .replace(/:\s+/, ':')
                .replace(/([0-9]+)(,)\s+/, function(str, val, comma) { return val + comma })
                .replace(/(,)\s+([0-9]+)/, function(str, comma, val) { return comma + val })
                .trim()
            );
        });

        return [selTrimmed, decTrimmed];
    });

    return res;
}

function handleFileSelect(uri) {
    const textbox = document.querySelector('#textbox');
    const create = document.querySelector('#create');
    let decAr = [];

    let textFile = null,
        makeTextFile = function(text) {
            const data = new Blob([text], { type: 'text/css' });

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            return textFile;
        };

    create.addEventListener('click', function() {
        const link = document.createElement('a');
        link.setAttribute('download', 'parsed.min.css');
        link.href = makeTextFile(textbox.value);
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function() {
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
            /*
            [0] = [Array(1), Array(1)]
            [0][0] = [".product__card,.product__bee,.product__tree,.product__willow,.product__cab "]
            [0][1] = ["    border: 1px solid #ddd;    border-radius: 10px…;    background-color: #fff;    margin: 10px 5px;"]
            */
            const splitSelectorsAndDeclarationsPairAr = splitPairAr(selectorsAndDeclarationsPairAr);
            /*
            [0] = [Array(5), Array(10)]
            [0][0] = [".product__card", ".product__bee", ".product__tree", ".product__willow", ".product__cab"]
            [0][1] = ["border:1px solid #ddd", "border-radius:10px", "-khtml-border-radius:10px", "-webkit-box-shadow:0px 0px 10px 3px #ddd", "box-shadow:0px 0px 10px 3px #ddd", "position:relative", "padding:8px", "color:#555", "background-color:#fff", "margin:10px 5px"]
            */
            let isSetToConsolidate = document.querySelector('.switch__input').checked;

            // build array
            splitSelectorsAndDeclarationsPairAr.map(ars => {

                // ars = [arr of selectors, arr of declarations]
                const selector = ars[0];
                const declaration = ars[1];

                // map each declaration to every selector
                const res = declaration.map((dec, idx) => {
                    //
                    // needs to fix this below 
                    //
                    decAr = decAr.filter(function(n) { return n != undefined });

                    if (dec) {
                        const decYes = decAr.some(ress => {
                            return ress.includes(dec);
                        });

                        if (!decYes) {
                            return [dec, [...selector]];
                        }

                        decAr.forEach((resss, idx) => {
                            if (resss[0] === dec) {
                                decAr[idx][1].push(...selector);
                            }
                        });
                    }

                });
                decAr.push(...res);
            });

            // remove empties
            decAr = decAr.filter(function(n) { return n != undefined });

            let rebuiltStr = decAr.map(ars => {
                // ars = [single declaration, arr of selectors]
                if (ars) {
                    const declaration = ars[0];
                    const selector = ars[1];

                    const addComma = selector.map(ar => {
                        return ar;
                    }).join(',');

                    return `${addComma}{${declaration}}`;
                }
            }).join('');

            // if set to consolidate
            if (isSetToConsolidate) {
                console.log('cc', decAr);
                // rebuild styles
                const consolidatedAr = decAr.reduce((ar, pair) => {
                    function sameSelector(selector) {
                        return selector[1].join('') === pair[1].join('');
                    }
                    var res = ar.find(sameSelector);
                    if (!!res) {
                        res[0].push(pair[0]);
                    } else {
                        ar.push([
                            [pair[0]], pair[1]
                        ]);
                    }
                    return ar;
                }, []);

                rebuiltStr = consolidatedAr.map(ars => {

                    // ars = [arr of declarations, arr of selectors]
                    // ["letter-spacing:.1em","margin:0"]
                    // [".product__card__vital-shared",".product__card__desc"]
                    if (ars) {
                        const declaration = ars[0];
                        const selector = ars[1];

                        const addComma = selector.map(ar => {
                            return ar;
                        }).join(',');

                        const addSemicolon = declaration.map(ar => {
                            return ar;
                        }).join(';');

                        return `${addComma}{${addSemicolon};}`;
                    }
                }).join('');
            }

            // print to file
            textbox.value = rebuiltStr;
        }).catch(function(error) {
            console.log(error);
        });

}

function startFunc(e) {
    var npt = e.target.type.toUpperCase();
    var fileList = e.target.value; // FileList object
    var re = /(css)$/gi;
    var mch, tmppath;

    if (npt === 'CHECKBOX') {
        fileList = _files.value; // FileList object
    }

    mch = !!fileList.match(re);

    // if there is no css file selected
    if (!mch && npt === 'CHECKBOX') return;

    if (!mch) {
        fileList = '';
        alert('Please select a css file!');
        return;
    }

    // get files from input
    fileList = _files.files;

    if (fileList) {
        if (typeof fileList !== "object") {
            alert('Please select a file!');
            return;
        } else if (!fileList.length) {
            alert('Please select a file!');
            return;
        }
    }

    // Loop through the FileList and render image fileList as thumbnails.
    for (var i = 0, f; f = fileList[i]; i++) {

        // Only process image fileList.
        if (!f.type.match('css$')) {
            e.target.value = '';
            alert('Please select a css file!');
            continue;
        }

        tmppath = URL.createObjectURL(f);
        handleFileSelect(tmppath)
    }
}

var _files = document.getElementById('files');
var _consolidate = document.querySelector('.switch__input');
_files.addEventListener('change', startFunc, false);
_consolidate.addEventListener('change', startFunc, false);
