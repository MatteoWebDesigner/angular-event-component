"use strict";

var
    gulp              = require('gulp'),
    _                 = require('lodash'),
    clean             = require('gulp-clean'),
    babel             = require("gulp-babel"),
    concat            = require("gulp-concat"),
    runSequence       = require('run-sequence'),
    sourcemaps        = require("gulp-sourcemaps"),
    livereload        = require('gulp-livereload'),
    size              = require('gulp-size'),

    // html
    // css
    postcss           = require('gulp-postcss'),
    cssEach           = require('postcss-each'),
    cssConditions     = require('postcss-conditionals'),
    cssMixins         = require('postcss-mixins'),
    cssNext           = require('postcss-cssnext'),
    cssLint           = require('stylelint'),
    cssDoiuse         = require('doiuse'),
    cssMqMin          = require("css-mqpacker"),
    cssNano           = require('cssnano'),
    cssMd             = require('mdcss'),
    
    // js
    uglify            = require('gulp-uglify'),
    ngAnnotate        = require('gulp-ng-annotate'),
    
    // config
    config            = require("./config.js"),
    bundle            = require("./bundle.js")
;

gulp.task('clean', function() {
    return gulp.src(config.dist)
		.pipe(clean({force: true}))
});

gulp.task('assets', function() {
    return gulp.src('client/assets/**/*',{ 'base' : './client' })
        .pipe(gulp.dest(config.dist));
});

gulp.task('cssVendor', function() {
    return gulp.src(bundle.cssLibs)
        .pipe(sourcemaps.init())
        .pipe(concat("vendor.css"))
        .pipe(postcss([
            cssNano()
        ]))
        .pipe(size({showFiles:true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist));
});

gulp.task('css', function() {
    return gulp.src(bundle.css)
        .pipe(sourcemaps.init())
        .pipe(concat("app.css"))
        .pipe(postcss([
            cssEach, // each is better comes before mixin
            cssConditions,
            cssMixins(), // postcss mixin are really fragile
            cssNext({
                browsers: config.browserSupport,
                warnForDuplicates: false
            }),
            cssLint({
                reporters: [{
                    formatter: 'string',
                    console: true
                }],
                debug: true
            }),
            // cssMd({need options}),
            //cssMqMin(),
            //cssNano(),
            cssDoiuse({
                browsers: config.browserSupport
            })
        ]))
        .pipe(size({showFiles:true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist));
});

gulp.task('jsVendor', () => {    
    return gulp.src(bundle.jsLibs)
        .pipe(sourcemaps.init())
        .pipe(concat("vendor.js"))
        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(size({showFiles:true}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.dist));
});

gulp.task('js', () => {    
    return gulp.src(bundle.js)
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat("app.js"))
        .pipe(ngAnnotate())
        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(size({showFiles:true}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.dist));
});

gulp.task('watch', () => {
    // gulp.watch('index.html', ['html']);
    gulp.watch(config.cssFiles, ['css']);
    gulp.watch(config.jsFiles, ['js']);
});

gulp.task('default', () => {
    runSequence(
        'clean',
        // 'css-stylelint',
        // ['fonts','html','jade','cssVendor','css','jsVendor','js'],
        // ['css-deprecated'],
        'assets',
        'cssVendor',
        'css',
        'jsVendor',
        'js',
        'watch'
    );
});
