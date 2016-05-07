#!/usr/bin/env node
"use strict";

let collectImg = require('../lib/core.js'),
	cmdInfo = require('../templates/cmd.js');

let main = function (){
	class ArgProcess{
		error(info){
			console.error(info);
			process.exit();
		}
		constructor(argv){

			/* 工作目录
				默认为当前目录
			 */
			this.workPath = './'

			/* 模式
				current		仅收集当前目录
				recursion	递归收集，并在输出时分类
			 */
			this.mode = 'current';

			/* 转换的格式
				html
				mobi

				默认为 html
			 */
			this.convert = 'html';

			/* 输出的文件名 */
			this.output = `output.${this.convert}`;

			this.argp(argv);
		}

		argp(argv){
			let argStatus = {

			};
			let isArg = (arg) => new RegExp(/^(-[a-zA-Z])/).test(arg);
			let getArg = function (argv, current){
				let item = argv[current+1];
				if ( item === undefined || isArg(item) ){
					item = false;
				}
				return item;
			};

			let i = 0;
			if ( !isArg(argv[i]) && argv[i] !== undefined ){
				this.workPath = argv[i];
				++i;
			}

			for ( ;i<argv.length; ++i ){
				switch ( argv[i] ){
					case '-mobi':{
						this.convert = 'mobi';
						if ( argStatus['-o'] === undefined ){
							this.output = `output.${this.convert}`;
						}
					}
					break;

					case '-o':
					case '-output':{
						let item = getArg(argv, i);

						if (item === false){
							this.error("fail, -o need a filename.");
						}


						this.output = item;
						argStatus['-o'] = item;
					}
					break;

					case '-r':
					case '-recursion':{
						this.mode = 'recursion';
					}
					break;

					case '-debug':{
						this.debug = true;
					}
					break;

					case '-h':
					case '-help':{
						console.info(cmdInfo.help);
						process.exit();
					}
					break;

					case '-v':
					case '-ver':
					case '-version':{
						console.info(require('../package.json').version);
						process.exit();
					}
					break;

					default:
				}
			}
		}
	}

	return function (argv){
		if ( argv === undefined ){
			argv = process.argv.slice(2);
		}
		var info = new ArgProcess(argv);

		info.debug && console.info(info);

		collectImg.collectImg(info);
	};
}();
main();
