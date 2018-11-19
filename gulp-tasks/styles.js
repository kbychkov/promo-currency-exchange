import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notifier from 'node-notifier';
import postcss from 'postcss';
import gulpPostcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import sprites from 'postcss-sprites';
import assets from 'postcss-assets';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cssmin from 'gulp-clean-css';
import gulpif from 'gulp-if';

import PATHS from '../paths';
import { PRODUCTION } from '../config';

// TODO: Протестировать, везде ли работает правильно.
// Если есть необходимость, то оптимизировать.
// UPD1. Найден момент, который необходимо поправить:
//     Было: .advantage:first-child, .advantage._v1:first-child { padding-top: 17.6vh; }
//     Стало: ._fix100vh .advantage:first-child, .advantage._v1:first-child { padding-top: calc(17.6vh - 17.6 / 100 * var(--fix100vhValue)) }
//     Должно быть: ._fix100vh .advantage:first-child, ._fix100vh .advantage._v1:first-child { padding-top: calc(17.6vh - 17.6 / 100 * var(--fix100vhValue)) }
const fixVieportHeight = postcss.plugin('postcss-fix-vh', function() {
	return function(root) {
		root.walkRules(function(rule) {
			rule.walkDecls(function(decl) {
				let value = decl.value;
				let hasVhUnits = /vh/.test(value) && !/calc\(.*vh.*\)/.test(value);
				if (!hasVhUnits) {
					return;
				}

				let newValue = value.replace(/([0-9\.\-]+)vh/g, 'calc($1vh - $1 / 100 * var(--fix100vhValue))');
				rule.parent.insertAfter(rule, `\n._fix100vh ${rule.selector} { ${decl.prop}: ${newValue} }`);
			});
		});
	};
});

const PROCESSORS = [
	fixVieportHeight(),
	autoprefixer({
		browsers: ['last 4 versions'],
		cascade: true,
	}),
	assets({
		loadPaths: [PATHS.src.imagesInline],
		cache: true,
	}),
	// TODO: Конфликт версий postcss и postcss-sprites.
	// Попытаться разобраться с этим делом...
	// sprites({
	// 	stylesheetPath: './build/media/css/',
	// 	spritePath: './build/media/img/sprite.png',
	// 	retina: true,
	// 	outputDimensions: true,
	// 	padding: 4,
	// 	filterBy: image => /sprites\/.*\.png$/gi.test(image.url),
	// }),
];

export default function styles() {
	return gulp
		.src(PATHS.src.styles)
		.pipe(
			plumber({
				errorHandler: function(err) {
					gutil.log(err.message);
					notifier.notify({
						title: 'SASS compilation error',
						message: err.message,
					});
				},
			})
		)
		.pipe(gulpif(!PRODUCTION, sourcemaps.init()))
		.pipe(
			sass({
				outputStyle: 'compact',
				errLogToConsole: true,
				indentedSyntax: true,
			})
		)
		.pipe(gulpPostcss(PROCESSORS))
		.pipe(gulpif(PRODUCTION, cssmin({ processImport: false })))
		.pipe(gulpif(!PRODUCTION, sourcemaps.write()))
		.pipe(gulp.dest(PATHS.build.styles));
}
