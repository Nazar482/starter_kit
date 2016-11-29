'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    plumber = require('gulp-plumber'),
    browserSync = require("browser-sync"),
    pug = require('gulp-pug'),
    reload = browserSync.reload;


// Paths
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        pug: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        pug: 'src/templates/*.pug', //Синтаксис src/*.pug говорит gulp что мы хотим взять все файлы с расширением .pug
        js: 'src/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
        sass: 'src/scss/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        pug: 'src/**/*.pug',
        js: 'src/js/**/*.js',
        sass: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// Dev server
var config = {
    server: {
        baseDir: "./build",
        index: "index.html"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "dev_server"

};

//Jade build
gulp.task('pug:build', function() {
    gulp.src(path.src.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(plumber())
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.pug)) // Записываем собранные файлы
        .pipe(reload({stream: true})); // даем команду на перезагрузку страницы
});

//Javascript build
gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(plumber())
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

//Sass build
gulp.task('sass:build', function () {
    gulp.src(path.src.sass) //Выберем наш main.scss
        .pipe(plumber())
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

//Images build
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(plumber())
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

//Fonts build
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(plumber())
        .pipe(gulp.dest(path.build.fonts))
});

//Build for all
gulp.task('build', [
    'pug:build',
    'js:build',
    'sass:build',
    'fonts:build',
    'image:build'
]);

//Gulp watcher
gulp.task('watch', function(){
    watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.sass], function(event, cb) {
        gulp.start('sass:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

//Livereload server
gulp.task('webserver', function () {
    browserSync(config);
});

//Cleaner
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

//Default task
gulp.task('default', ['build', 'webserver', 'watch']);