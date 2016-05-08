"use strict";
let fs = require("fs"),
	path = require('path'),
	config = require('./../config.json'),
	exec = require('child_process').exec,
	errorTemplates = require('../templates/error.js');

class CollectImage{
	error(info){
		console.error(`! core-error\n${info}`);
		process.exit();
	}

	warn(info){
		console.warn(`* core-warning\n${info}`);
	}

	fetchDir(dir){
		let tab = '';

		let fetch = function (dir){
			var d = fs.readdirSync(dir);
			for ( var i=0; i<d.length; ++i ){
				output( d[i], dir);
			}
		},
		output = function (file, dir){
			let pathName = path.join(dir, file);

			/* console.log(tab, file); */
			if ( fs.statSync(pathName).isDirectory() ){
				tab += " ";
				fetch(pathName);
				tab = tab.substr(1);
			}
		};
		fetch(dir);
	}

	saveFileSync(fileName, file){
		fs.writeFileSync(fileName, file);
	}

	convert_mobi(convertFile){
		this.saveFileSync( `${this.info.workPath}/mobiraw.html`, this.convert_html() );
		console.log("converting mobi file……");

		let cmdStr = `"${config.kindlegen}" "${this.info.workPath}/mobiraw.html" -c0 -o ${this.info.output} `;
		this.info.debug && console.info(cmdStr);

		exec(cmdStr);
	}
	convert_html(){
		let isImageSuffix = (fileName) => new RegExp(/.(jpeg)|(jpg)|(png)|(webp)|(gif)|(bmp)$/).test(fileName),
		outImgTag = (src) => `<img src="${src}" />\n`,
		fetchImage = function (dir, callback){
			fs.readdirSync(dir).forEach( (file) => isImageSuffix(file) && callback(file) );

			let doc = "<!doctype HTML>\n<html>\n<body>\n"+ html +"</body>\n</html>";
			return doc;
		};

		console.info("Converting HTML...");

		let html = ''
		fetchImage(this.info.workPath, function (file){
			html += outImgTag(file);
		});

		let doc = `<!doctype HTML>\n<html>\n<body>\n${html}</body>\n</html>`;

		let doneInfo = `Converting HTML done`;

		if ( this.info.convert === 'html' ){
			fs.writeFileSync(`${this.info.workPath}/${this.info.output}`, doc);
			doneInfo += `, \`${this.info.output}\` saved.`;
		}

		console.info(doneInfo);
		return doc;
	}
	convert(){
		let method = `convert_${this.info.convert}`;
		this.info.debug && console.log( method );
		this[method]();
	}

	preProcess(info){
		let isDirectory = function (dir){
			try{
				return fs.statSync(dir).isDirectory();
			}catch(e){
				return false;
			}
		};
		if ( !isDirectory(info.workPath) ){
			this.error(errorTemplates.workPath);
		}

		this.info = info;
	}

	collectImg(info){
		this.preProcess(info)

		this.convert();

	}

};

module.exports = new CollectImage;
