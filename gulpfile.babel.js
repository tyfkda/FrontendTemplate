'use strict'

import gulp from 'gulp'
const browserSync = require('browser-sync').create()

// ES6
import sourcemaps from 'gulp-sourcemaps'
import eslint from 'gulp-eslint'
import babel from 'gulp-babel'
import webpack from 'webpack-stream'
import webpackConfig from './webpack.config.babel'

// HTML
import ejs from 'gulp-ejs'
import htmlmin from 'gulp-htmlmin'

// SASS
import sass from 'gulp-sass'
import cssnano from 'gulp-cssnano'

// Unit test
import karma from 'gulp-karma'

import plumber from 'gulp-plumber'
import del from 'del'

const destDir = './public'
const assetsDir = `${destDir}/assets`
const srcEs6Dir = './src'
const srcEs6Files = `${srcEs6Dir}/**/*.js`
const destJsDevDir = `${destDir}/jsdev`
const srcHtmlDir = './src'
const srcHtmlFiles = `${srcHtmlDir}/*.html`  // */
const srcSassFiles = './src/**/*.scss'
const srcTestFiles = './test/**/*.spec.js'
const releaseDir = './release'
const releaseAssetsDir = `${releaseDir}/assets`

const convertHtml = (buildTarget, dest) => {
  return gulp.src([srcHtmlFiles,
            '!' + srcHtmlDir + '/**/_*.html'])
    .pipe(plumber())
    .pipe(ejs({buildTarget: buildTarget}))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
    }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({stream: true}))
}

const buildEs6ForDebug = (glob) => {
  return gulp.src(glob, {base: srcEs6Dir})
    .pipe(plumber())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      plugins: ['transform-es2015-modules-amd'],
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destJsDevDir))
    .pipe(browserSync.reload({stream: true}))
}

const lint = (glob) => {
  return gulp.src(glob)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
}

const buildWhenModified = (glob, buildFunc) => {
  gulp.watch(glob, (obj) => {
    if (obj.type === 'changed')
      buildFunc(obj.path)
  })
}

gulp.task('default', ['watch'])

gulp.task('watch', ['build', 'server', 'watch-es6', 'watch-lint', 'watch-test'], () => {
  gulp.watch(srcHtmlFiles, ['html'])
  gulp.watch(srcSassFiles, ['sass'])
})

gulp.task('build', ['html', 'es6', 'sass'])

gulp.task('html', () => {
  return convertHtml('debug', destDir)
})

gulp.task('es6', () => {
  return buildEs6ForDebug(srcEs6Files)
})

gulp.task('watch-es6', [], () => {
  buildWhenModified(srcEs6Files,
                    buildEs6ForDebug)
})

gulp.task('lint', () => {
  return lint(['gulpfile.babel.js',
               srcEs6Files,
               srcTestFiles,
               'tools/**/*.js',
               '!src/es6/patches.js'])
})

gulp.task('watch-lint', [], () => {
  buildWhenModified([srcEs6Files,
                     srcTestFiles,
                     'gulpfile.babel.js'],
                    lint)
})

gulp.task('sass', () => {
  return gulp.src(srcSassFiles)
    .pipe(plumber())
    .pipe(sass())
    .pipe(cssnano())
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: destDir,
    },
  })
})

// Unit test.
const testFiles = [
  srcTestFiles,
]
gulp.task('test', () => {
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
    }))
    .on('error', err => console.log('Error : ' + err.message))
})
gulp.task('watch-test', () => {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch',
    }))
})

gulp.task('clean', del.bind(null, [
  `${destDir}/index.html`,
  `${assetsDir}/*.js`,  // */
  `${assetsDir}/*.map`,  // */
  `${assetsDir}/*.css`,  // */
  `${destJsDevDir}`,  // */
]))

gulp.task('release', ['build'], () => {
  // Copy resources.
  gulp.src([`${destDir}/**/*.*`,
            `!${destDir}/index.html`,
            `!${destJsDevDir}/**/*.*`,
            `!${destDir}/**/*.map`,
           ],
           {base: destDir})
    .pipe(gulp.dest(releaseDir))

  // Build HTML for release.
  convertHtml('release', releaseDir)

  // Concatenate es6 into single 'assets/main.js' file.
  gulp.src(`${srcEs6Dir}/main.js`)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(releaseAssetsDir))
})
