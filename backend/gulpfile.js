/**
 * Gulpタスクを管理する
 * 開発環境の設定ファイルをインポート
 */
const conf = require('./conf')

// ------------------------------------------------------------ //
// Packages
// ------------------------------------------------------------ //
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const sassGlob = require('gulp-sass-glob');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const cssSort = require('css-declaration-sorter');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const eslint = require('gulp-eslint');

// ------------------------------------------------------------ //
// Tasks
// ------------------------------------------------------------ //

/**
 * JavaScriptをトランスパイル
 * １ファイルにまとめてminify化
 */

const js = (done) => {
    return gulp.src(`${conf.path.src}**/!(_)*.es6`)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(eslint({useEslintrc: true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(babel({
            "presets": ["@babel/preset-env"]
        }))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * Scss -> CSS にコンパイル
 * 1ファイルにまとめてminify化
 */

const stylelint = (done) => {
    return gulp.src(`${conf.path.src}**/*.scss`)
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(
            gulpStylelint({
            failAfterError: true,
            reportOutputDir: './',
            reporters: [
                {formatter: 'verbose', console: true},
                {formatter: 'json', save: 'report.json'},
            ],
            fix: true
            })
        )
    done();
}

const scss = (done) => {
    return gulp.src(`${conf.path.src}**/!(_)*.scss`)
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(sassGlob())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(postcss([autoprefixer()]))
        .pipe(postcss([cssSort({ order: 'alphabetical' })]))
        .pipe(gulp.dest(`${conf.path.dist}`))
        .pipe(cleanCss())
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(gulp.dest(`${conf.path.dist}`))
        done();
}

/**
 * テーマで使用する画像ファイルを圧縮する
 */
const image = (done) => {
    return gulp.src(`${conf.path.src}**/*.{jpg,jpeg,png,gif,mp4,svg}`)
    .pipe(imagemin())
    .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * テーマで使用するフォントをコピーする
 */
const font = (done) => {
    return gulp.src(`${conf.path.src}**/*.{woff,woff2,ttf}`)
    .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * ローカルサーバーを起動
 */
const serve = (done) => {
    browserSync({
        open: false,
        startPath: '/',
            proxy: `${conf.localhost}`,
        reloadDelay: 1000,
        once: true,
        notify: false,
        ghostMode: false,
    });
    done();
}

/**
 * ファイル保存時ローカルサーバーの自動リロード
 */
const reload = (done) => {
    browserSync.reload();
    done();
}

/**
 * ファイルの変更・保存を監視
 */
const filewatch = (done) => {
    gulp.watch([`${conf.path.src}**/*.scss`], gulp.series(stylelint, scss, reload));
    gulp.watch([`${conf.path.src}**/*.php`], gulp.series(reload));
    gulp.watch([`${conf.path.src}**/*.es6`], gulp.series(js, reload));
    gulp.watch([`${conf.path.src}**/*.{jpg,jpeg,png,gif,mp4,svg}`], gulp.series(image, reload));
    gulp.watch([`${conf.path.src}**/*.{woff,woff2,ttf}`], gulp.series(font, reload));
    done();
}

/**
 * Gulpタスクをデフォルトのコマンドで起動
 * $ npx gulp
 */
gulp.task('default', gulp.series(
    gulp.parallel(js, image, stylelint, scss, font, filewatch),
    serve
));
