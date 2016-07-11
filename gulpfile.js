var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var bower = require('bower');
var sh = require('shelljs');
var wiredep = require('wiredep');
var cleandir = require('clean-dir');
var runSequence = require('run-sequence');
var lazypipe = require('lazypipe');
var trash = require('trash');
var mainBowerFiles = require('main-bower-files');

var paths = {
  sass: ['./development/scss/**/*.scss'],
  appJS: ['./development/**/*.js'],
  css: ['./development/**/*.css'],
  template: ['./development/**/template/*.html'],
  html: ['./development/**/*.html', '!./development/**/template/*.html', '!./development/index.html'],
  assets: [ './development/**/*.*',
            '!./development/scss/**/*.scss',
            '!./development/**/*.js',
            '!./development/**/*.css',
            '!./development/**/template/*.html',
            '!./development/**/*.html',
            '!./development/index.html'],
  vendorJS: ['./bower_components/**/*.js'],
  vendor: ['./bower_components/**/*.css',
           './bower_components/**/*.ttf', './bower_components/**/*.woff', './bower_components/**/*.svg'],
};

var wiredepConfig = {
    cwd: '',
    dependencies: true,
    devDependencies: true,
};

var isProduction = false;

gulp.task('clean', function(cb){
    cleandir('./www', cb);
});

gulp.task('copy:assets', function(cb) {
  return gulp.src(paths.assets, {
    base: './development/'
  })
  // .pipe($.plumber())
  .pipe(gulp.dest('./www'));
});

gulp.task('copy:sass', function(done) {
  gulp.src(paths.sass)
    // .pipe($.plumber())
    .pipe($.sass({
      errLogToConsole: true
    }))
    .pipe($.cleanCss({
      keepSpecialComments: 0
    }))
    .pipe($.rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('copy:css', function(cb) {
    var minifyTask = lazypipe()
        .pipe($.cleanCss, { keepSpecialComments: 0, rebase: true, target: './development/' })
        .pipe($.concat, 'app.css');
    var minifyIf = $.if(isProduction, minifyTask().on('error', function(e){
        console.log(e);
    }));

  return gulp.src(paths.css, {
    base: './development/'
  })
  .pipe(minifyIf)
  .pipe(gulp.dest('./www'));
});

gulp.task('copy:js', function(cb) {
    var uglifyTask = lazypipe()
        .pipe($.angularFilesort)
        .pipe($.concat, 'app.js')
        .pipe($.uglify, {mangle: false});
    var uglifyIf = $.if(isProduction, uglifyTask().on('error', function(e){
        console.log(e);
    }));
    return gulp.src(paths.appJS)
    // .pipe($.plumber())
    // .pipe($.angularModule())
    .pipe($.ngAnnotate({single_quotes: true}))
    .pipe(uglifyIf)
    .pipe(gulp.dest('./www'));
});

gulp.task('copy:vendor:js', function(cb) {
    return gulp.src(mainBowerFiles(/* options */), { base: './bower_components' })
    // .pipe($.plumber())
    // .pipe($.uglify({mangle: false}))
    .pipe(gulp.dest('./www/lib'));
});
gulp.task('copy:vendor:other', function(cb) {
    return gulp.src(paths.vendor)
    // .pipe($.plumber())
    .pipe(gulp.dest('./www/lib'));
});
gulp.task('copy:vendor', ['copy:vendor:js', 'copy:vendor:other']);

gulp.task('copy:html', function(cb){
    var uglifyTask = lazypipe()
        .pipe($.htmlmin, {collapseWhitespace: true, removeComments: true})
        .pipe($.angularTemplatecache, { module: 'app' })
        .pipe($.uglify, {mangle: false})
        .pipe($.concat, "template.min.js");
    var uglifyIf = $.if(isProduction, uglifyTask().on('error', function(e){
        console.log(e);
    }));
    return gulp.src(paths.html)
        .pipe(uglifyIf)
        .pipe(gulp.dest('./www'));
});

gulp.task('copy:template', function(cb){
    return gulp.src(paths.template)
        // .pipe($.plumber())
        .pipe($.htmlmin())
        .pipe($.ngHtml2js({

        }))
        .pipe($.uglify())
        .pipe($.concat('directive-templates.js'))
        .pipe(gulp.dest('./www'));
});

gulp.task('copy', ['copy:assets', 'copy:js', 'copy:sass', 'copy:css', 'copy:vendor', 'copy:template', 'copy:html']);

gulp.task('wiredep', function() {
    return gulp.src('./development/index.html')
        .pipe(wiredep.stream({
            cwd: '',
            dependencies: true,
            devDependencies: true,
            fileTypes: {
                html: {
                    replace: {
                        js: function(filePath) {
                            $.util.log(filePath);
                            return '<script type="text/javascript" src="' + filePath.replace("../bower_components", "./lib") + '"></script>';
                        },
                        css: function(filePath) {
                            return '<link rel="stylesheet" href="' + filePath.replace("../bower_components", "./lib") + '" type="text/css"/>';
                        }
                    }
                }
            }
        }))
        .pipe($.inject(
            gulp.src(['./www/**/*.js', '!./www/lib/**/*.js'])
            .pipe($.angularFilesort()), {
                addRootSlash: false,
                transform: function(filePath, file, i, length) {
                    $.util.log(filePath);
                    return '<script src="' + filePath.replace('www/', './') + '"></script>';
                }
            })
        )
        .pipe($.inject(
            gulp.src(['./www/**/*.css', '!./www/lib/**/*.css'], { read: false }), {
                addRootSlash: false,
                transform: function(filePath, file, i, length) {
                    $.util.log(filePath);
                    return '<link rel="stylesheet" href="' + filePath.replace('www/', './') + '" type="text/css"/>';
                }
        }))
        .pipe(gulp.dest('www'));
});

gulp.task('build', function(cb){
    runSequence('clean', 'copy', 'wiredep', cb);
});

gulp.task('default', function(cb){
    runSequence('build', cb);
});

gulp.task('watch', function() {
    //watch deleted file / folder
    $.watch(['./development/**/*.*', '!./development/**/*.*~', './development/**/'], {events: ['unlink', 'unlinkDir']}, function(file){
        console.log("heyyyyyyy....");
        if (file !== null) {
            var deletefile = './www/'+file.relative;
            trash([deletefile])
            .then(function(){
                console.log("deleted " + deletefile);
            });
        }
    });
    //watch add/change file
    $.watch(paths.assets, {events: ['add', 'change']}, function(){
        runSequence('copy:assets', 'wiredep');
    });
    $.watch(paths.sass, {events: ['add', 'change']}, function(){
        runSequence('copy:sass', 'wiredep');
    });
    $.watch(paths.css, {events: ['add', 'change']}, function(){
        runSequence('copy:css', 'wiredep');
    });
    $.watch(paths.appJS, {events: ['add', 'change']}, function(){
        runSequence('copy:js', 'wiredep');
    });
    $.watch(paths.vendorJS, {events: ['add', 'change']}, function(){
        runSequence('copy:vendor', 'wiredep');
    });
    $.watch(paths.vendor, {events: ['add', 'change']}, function(){
        runSequence('copy:vendor', 'wiredep');
    });
    $.watch(paths.template, {events: ['add', 'change']}, function(){
        runSequence('copy:template', 'wiredep');
    });
    $.watch(paths.html, {events: ['add', 'change']}, function(){
        runSequence('copy:html', 'wiredep');
    });
    $.watch('./development/index.html', {events: ['add', 'change']}, function(){
        runSequence('wiredep');
    });
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      $.util.log('bower', $.util.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + $.util.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', $.util.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + $.util.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
