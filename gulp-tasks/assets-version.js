import gulp from 'gulp';
import PATHS from '../paths';
import { PRODUCTION } from '../config';

var replace = require('gulp-replace');
var fs = require('fs');
const md5File = require('md5-file');

const buildPath = PATHS.build.html.replace(/\/$/, '');

export default function assetsVersion() {
	return gulp
		.src(buildPath + '/**/*.html')
		.pipe(
			replace(/([\w\/]+\.[js|css]+\?)<%= hash %>/gi, function(match) {
				var assetPath = __dirname.replace('gulp-tasks', buildPath) + match;
				assetPath = assetPath.substring(0, assetPath.indexOf('?'));

				var hash = '';
				if (fs.existsSync(assetPath)) {
					hash = md5File.sync(assetPath);
				} else {
					hash = parseInt(Math.random() * new Date(), 10);
				}

				var res = match.replace('<%= hash %>', '');
				res = PRODUCTION ? res + hash : res.replace('?', '');
				return res;
			})
		)
		.pipe(gulp.dest(buildPath));
}
