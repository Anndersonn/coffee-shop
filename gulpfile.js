let project_folder = "dist";
let source_folder = "src";

let fs = require('fs');

/*----------------------------------------
            FINAL FOLDER CREATION
----------------------------------------*/

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
}

/*----------------------------------------
                MODULES
----------------------------------------*/

let {src,dest} = require('gulp'),
        gulp = require('gulp'),
        browsersync = require('browser-sync').create();
        fileinclude = require('gulp-file-include');
        scss = require('gulp-sass');
        autoprefixer = require('gulp-autoprefixer');
        group_media = require('gulp-group-css-media-queries');
        clean_css = require('gulp-clean-css');
        rename = require('gulp-rename');
        uglify = require('gulp-uglify-es').default;
        babel = require('gulp-babel');
        imagemin = require('gulp-imagemin');
        webp = require('gulp-webp');
        webphtml = require('gulp-webp-html');
        webpcss = require('gulp-webpcss');

/*----------------------------------------
                BROWSERSYNC
----------------------------------------*/
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    })
}

/*----------------------------------------
                    HTML
----------------------------------------*/

function html() {
    return src(path.src.html)
        .pipe(webphtml())
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}
/*----------------------------------------
                STYLES
----------------------------------------*/
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(group_media())
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

/*----------------------------------------
                JS
----------------------------------------*/
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

/*----------------------------------------
                IMAGES
----------------------------------------*/
function images() {
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 3,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())

}

/*----------------------------------------
                WATCHING
----------------------------------------*/
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

/*----------------------------------------
                PARALLELS
----------------------------------------*/
let build = gulp.series(gulp.parallel (js, css, html, images));
let watch = gulp.parallel(build, watchFiles, browserSync);


/*----------------------------------------
                EXPORTS
----------------------------------------*/
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;