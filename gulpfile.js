// load plugin
var gulp = require('gulp'),
	$ = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'gulp.*'],
		replaceString: /\bgulp[\-.]/
	}),
	browserSync = require('browser-sync'),
	runSequence = require('run-sequence');

// path string
var paths = {
	'mdDir': 'markdown/*.md',
	'htmlDir': 'html/**',
	'jsDir': 'js/*.js',
	'cssDir': 'style/*.css',
	'imageDir': 'image/**',
	'destDir': 'build/'
};

// module of me
var app = require('./app/index.js');
gulp.task('app', function(){
	var fs = require('fs');
	var path = require('path');
	path.exists('build', function(exists){
		if(!exists){fs.mkdirSync('build', 0777);}
	})
	path.exists('build/image', function(exists){
		if(!exists){fs.mkdirSync('build/image', 0777);}
	})
	var source = fs.readFileSync('html/header.html', 'utf-8');
	source += app.parse(fs.readFileSync('markdown/document.md', 'utf-8'));
	source += fs.readFileSync('html/footer.html', 'utf-8');
	fs.writeFile(paths.destDir + 'index.html', source);
});

// browser sync
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: paths.destDir
		}
	});
});

// js
gulp.task('jslint', function() {
	return gulp.src(paths.jsDir)
		.pipe($.jshint())
		.pipe($.jshint.reporter());
});

gulp.task('buildjs', function() {
	return gulp.src(paths.jsDir)
		.pipe($.uglify())
		.pipe($.concat('script.js'))
		.pipe(gulp.dest(paths.destDir));
});

gulp.task('concatjs', function() {
	return gulp.src(paths.jsDir)
		.pipe($.concat('script.js'))
		.pipe(gulp.dest(paths.destDir));
});

// other task
gulp.task('copy', function() {
	gulp.src(paths.cssDir).pipe(gulp.dest(paths.destDir));
	gulp.src(paths.imageDir).pipe(gulp.dest(paths.destDir + '/image'));
	return browserSync.reload();
});

gulp.task('watch', function() {
	gulp.watch([paths.cssDir], ['copy']);
	gulp.watch([paths.jsDir]), ['concatjs'];
});

gulp.task('build', function() {
	runSequence('app', 'jslint', 'buildjs', 'watch', 'browserSync');
});

gulp.task('test', function() {
	runSequence('app', 'copy', 'jslint', 'concatjs', 'watch', 'browserSync');
});

gulp.task('default', ['test']);
