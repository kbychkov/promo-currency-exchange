import gulp from 'gulp';
import PATHS from '../paths';

export default function images() {
	return gulp
		.src([PATHS.src.images, `!${PATHS.src.imagesInline}/**.*`, `!${PATHS.src.sprites}`])
		.pipe(gulp.dest(PATHS.build.images));
}
