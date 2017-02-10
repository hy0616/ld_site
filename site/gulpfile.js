// 引入 gulp

var gulp = require('gulp');
var gutil = require('gulp-util')
var concat = require('gulp-concat');
// var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var minifyCss = require('gulp-minify-css');
// var sass = require("gulp-sass");
var rename = require("gulp-rename");
var inject = require('gulp-inject');
var path = require('path');
var _ = require('lodash');
// var del = require('del');
var shell = require('gulp-shell')


var DEST_DIR = "./assets/dist";
var INDEX_FILE = "./assets/app/index.html";
var INDEX_DIR = "./assets/app";
var HOME_INDEX_FILE = "./views/home/index.html";
var HOME_EJS_FILE = "./views/home/index.ejs";
var HOME_EJS_DIR = "./views/home";

var CSS_DIST_DIR = "./assets/dist/assets/css";
var JS_DIST_DIR = 'assets/dist/scripts';

var CSS_DIST_FILE = "assets/dist/assets/css/all.gz.css";
var LIB_JS_DIST_FILE = "assets/dist/scripts/lib_js_all.gz.js";
var LOGIC_JS_DIST_FILE = "assets/dist/scripts/logic_js_all.gz.js";

// var CSS_DIST_FILE = "assets/dist/assets/css/all.css";
// var LIB_JS_DIST_FILE = "assets/dist/scripts/lib_js_all.js";
// var LOGIC_JS_DIST_FILE = "assets/dist/scripts/logic_js_all.js";

var LIB_JS_FILES = [
    'assets/bower_components/jquery/dist/jquery.min.js',
    'assets/bower_components/angular/angular.min.js',
    "assets/bower_components/angular-route/angular-route.js",
    "assets/bower_components/angular-animate/angular-animate.js",
    "assets/bower_components/bootstrap/dist/js/bootstrap.js",
    "assets/bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "assets/bower_components/angular-xeditable/dist/js/xeditable.js",
    "assets/bower_components/jquery-autosize/jquery.autosize.js",
    "assets/bower_components/jScrollPane/script/jquery.mousewheel.js",
    "assets/bower_components/jScrollPane/script/mwheelIntent.js",
    "assets/bower_components/jScrollPane/script/jquery.jscrollpane.min.js",
    "assets/bower_components/ng-grid/ng-grid-2.0.11.min.js",

    "assets/bower_components/enquire/dist/enquire.js",
    "assets/bower_components/lodash/dist/lodash.compat.js",
    "assets/bower_components/highcharts-ng/dist/highcharts-ng.js",
    "assets/bower_components/angular-translate/angular-translate.js",
    "assets/bower_components/angular-sails/dist/angular-sails.js",
    "assets/bower_components/angular-local-storage/dist/angular-local-storage.js",
    "assets/bower_components/angular-toastr/dist/angular-toastr.js",

    "assets/bower_components/angular-form-for/dist/form-for.js",
    "assets/bower_components/angular-ui-select/dist/select.js",
    "assets/bower_components/angular-form-for/dist/form-for.default-templates.js",
    "assets/bower_components/angular-touch/angular-touch.js",
    "assets/bower_components/angular-loading-bar/build/loading-bar.js",
    "assets/bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js",
    "assets/bower_components/is_js/is.js",
    "assets/bower_components/odometer/odometer.js",
    "assets/bower_components/angular-odometer-js/dist/angular-odometer.js",
    "assets/bower_components/angular-cookies/angular-cookies.js",

    "assets/bower_components/moment/min/moment.min.js",
    "assets/bower_components/moment/locale/zh-cn.js",
    "assets/bower_components/angular-moment/angular-moment.min.js",

    "assets/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js",

    'assets/app/assets/plugins/highchart/highcharts.src.js',
    'assets/app/assets/plugins/leaflet/leaflet.js',
    "assets/app/assets/plugins/leaflet/leaflet.markercluster.js",
    'assets/app/assets/plugins/leaflet/angular-leaflet-directive.js',
    'assets/app/assets/plugins/progress-skylo/skylo.js',
    'assets/app/assets/plugins/socket.io.js'

];

var LOGIC_JS_FILES = [
    "assets/app/scripts/shared/Services.js",
    "assets/app/scripts/shared/Directives.js",
    "assets/app/scripts/shared/shareData.js",
    "assets/app/scripts/maps/LeafLetMap.js",
    "assets/app/scripts/tile/ChannelTiles.js",
    "assets/app/scripts/tile/HeaderTiles.js",
    "assets/app/scripts/controllers/Manager.js",

    "assets/app/scripts/ui-elements/Panels.js",

    "assets/app/scripts/pages/Controllers.js",
    "assets/app/scripts/templates/templates.js",
    "assets/app/scripts/templates/overrides.js",
    "assets/app/scripts/controllers/Navigation.js",

    "assets/app/scripts/controllers/Dashboard.js",
    "assets/app/scripts/controllers/Analysis.js",
    "assets/app/scripts/controllers/Me.js",
    "assets/app/scripts/controllers/Auth.js",
    "assets/app/scripts/controllers/Alarm.js",
    "assets/app/scripts/controllers/personalSetting.js",

    "assets/app/scripts/models/index.js",
    "assets/app/scripts/models/DevModel.js",

    "assets/app/scripts/services/index.js",
    "assets/app/scripts/services/DevService.js",
    "assets/app/scripts/services/MapService.js",
    "assets/app/scripts/services/HighchartService.js",
    "assets/app/scripts/services/UtilService.js",
    "assets/app/scripts/services/TranslateService.js",
    "assets/app/scripts/services/AuthService.js",
    "assets/app/scripts/services/NotifyService.js",
    "assets/app/scripts/services/BaiduMapService.js",
    "assets/app/scripts/services/PushWebService.js",
    "assets/app/scripts/app.js"

];


var CSS_FILES = [
    "assets/app/assets/css/theme/vender.css",
    "assets/app/assets/css/page/base.css",
    "assets/app/assets/css/page/dashboard.css",
    "assets/app/assets/css/page/analysis.css",
    "assets/app/assets/css/page/me.css",
    "assets/app/assets/css/page/manager.css",
    "assets/app/assets/css/page/alarm.css",
    "assets/app/assets/css/page/personal.css",

    "assets/bower_components/bootstrap/dist/css/bootstrap.css",
    "assets/bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css",
    "assets/bower_components/angular-xeditable/dist/css/xeditable.css",
    "assets/bower_components/select2/select2.css",
    "assets/bower_components/jScrollPane/style/jquery.jscrollpane.css",
    "assets/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css",
    "assets/bower_components/angular-toastr/dist/angular-toastr.css",
    "assets/bower_components/angular-form-for/dist/form-for.css",
    "assets/bower_components/angular-ui-select/dist/select.css",
    "assets/bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.css",
    "assets/bower_components/odometer/themes/odometer-theme-default.css",
    "assets/bower_components/ng-grid/ng-grid.min.css",
    "assets/app/assets/css/devices.min.css",

    "assets/app/assets/css/main.css",
    "assets/app/assets/css/styles.css",

    "assets/app/assets/plugins/datetime/jquery.datetimepicker.css",
    "assets/app/assets/plugins/progress-skylo/skylo.css",
    "assets/app/assets/plugins/leaflet/leaflet.css",
    "assets/app/assets/plugins/leaflet/MarkerCluster.css",
    "assets/app/assets/plugins/leaflet/MarkerCluster.Default.css",
    'assets/app/assets/plugins/tipsy/tipsy.css',
    "assets/bower_components/angular-toastr/dist/angular-toastr.css",
    "assets/bower_components/angular-form-for/dist/form-for.css",

];

var assetsToMove = [
    // 'assets/app/fonts/**/*',
    'assets/app/assets/fonts/**/*',
    'assets/app/assets/img/**/*',
    'assets/app/assets/plugins/login/**',
    'assets/app/assets/plugins/video/**',
    'assets/app/assets/plugins/Navigation/**',
    'assets/app/assets/plugins/jquery.toast.min.js',
    'assets/app/assets/plugins/jquery.toast.min.css',
    'assets/app/views/**/*',
    'assets/app/index.html'
];

//todo: 404
gulp.task("copy_assets", function () {
    return gulp.src(assetsToMove, {base: "./assets/app"}).
        pipe(gulp.dest(DEST_DIR));
});

gulp.task('inject_dev', function () {
    var target = gulp.src(INDEX_FILE);
    var sources = gulp.src(_.flatten([CSS_FILES, LIB_JS_FILES, LOGIC_JS_FILES]), {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(INDEX_DIR));
    // .pipe(gulp.dest(HOME_EJS_DIR));
});

gulp.task('minify_css', function () {
    return gulp.src(CSS_FILES)
        .pipe(concat('all.css'))
        .pipe(minifyCss())
        .pipe(gzip({append: false, preExtension: 'gz'}))
        .pipe(gulp.dest(CSS_DIST_DIR));
});

gulp.task('minify_lib_js', function () {
    return gulp.src(LIB_JS_FILES)
        .pipe(concat('lib_js_all.js'))
        .pipe(uglify().on('error', gutil.log))
        .pipe(gzip({append: false, preExtension: 'gz'}))
        .pipe(gulp.dest(JS_DIST_DIR));
});

gulp.task('minify_logic_js', function () {
    return gulp.src(LOGIC_JS_FILES)
        .pipe(concat('logic_js_all.js'))
        .pipe(gzip({append: false, preExtension: 'gz'}))
        .pipe(gulp.dest(JS_DIST_DIR));
});

// gulp.task('clean_dist', function(){
//   return del(["assets/dist/**/*"]);
// });

gulp.task('clean_dist', shell.task([
    'rm -rf assets/dist/*'
]));

// gulp.task('clean_dist', function(){
//   return del(["assets/dist/**/*"]);
// });

gulp.task('inject_pub', ["clean_dist", 'minify_css', 'minify_lib_js', 'minify_logic_js', "copy_assets"], function () {
    var target = gulp.src("./assets/dist/index.html");
    var sources = gulp.src(_.flatten([CSS_DIST_FILE, LIB_JS_DIST_FILE, LOGIC_JS_DIST_FILE]), {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(INDEX_DIR));
});

gulp.task('rename_pub', ['inject_pub'], function () {
    return gulp.src(INDEX_FILE)
        .pipe(rename(HOME_EJS_FILE))
        .pipe(gulp.dest("./"));
});

gulp.task('rename_to_ejs', ['inject_dev'], function () {
    return gulp.src(INDEX_FILE)
        .pipe(rename(HOME_EJS_FILE))
        .pipe(gulp.dest("./"));
});

gulp.task('dev', function () {
    console.log("----------------------------------------------");
    console.log("*********** for development env **************");
    console.log("----------------------------------------------");

    gulp.run(['inject_dev', 'rename_to_ejs']);
});


gulp.task('default', function () {
    console.log("----------------------------------------------");
    console.log("*********** default publish **************");
    console.log("----------------------------------------------");

    gulp.run(['inject_pub', 'rename_pub']);
});

/*
 gulp.task('scripts', function() {
 // return gulp.src('./static/min/*.gz')
 return gulp.src('./static/js/lib/*.js')
 .pipe(concat('all.js'))
 .pipe(uglify())
 .pipe(gzip())
 // .pipe(gulp.dest('./static/dist/'))
 // .pipe(rename('alllib.min.js.gz'))
 .pipe(gulp.dest('./static/dist/'));
 });

 gulp.task('minify-css', function() {
 return gulp.src('./static/css/*.css')
 .pipe(minifyCss())
 .pipe(concat('all.css'))
 .pipe(gulp.dest('./static/dist'));
 });

 gulp.task('sass-css', function() {
 return gulp.src('./static/sass/*.scss')
 .pipe(sass().on('error', sass.logError))
 .pipe(concat('all_sass.css'))
 .pipe(minifyCss())
 .pipe(gulp.dest('./static/dist'));
 });

 gulp.task('copy-image', function(){
 return gulp.src('./static/img/stripes.png')
 .pipe(gulp.dest('./static/dist'));
 });


 */



