var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webpack = require('gulp-webpack');

var paths = {
	src: ['src/*.js', "src/**/*.js"],
	dist: 'dist',
};

var babelOpts = {
	presets: ['es2015', 'react'],
	plugins: [],
};

var webpackOpts = {
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react'],
				},
			},
		],
	},
};

gulp.task('example', ['main'], function() {
	return gulp
		.src('example/emotion-editor.js')
		.pipe(webpack(webpackOpts))
		.pipe(rename('emotion-editor.bundle.js'))
		.pipe(gulp.dest('example'));
});

gulp.task('main', function() {
	return gulp
		.src(paths.src, { base: 'src' })
		.pipe(rename('react-emotion-editor.js'))
		.pipe(babel(babelOpts))
		.pipe(gulp.dest(paths.dist))
		.pipe(rename('react-emotion-editor.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['main', 'example']);
