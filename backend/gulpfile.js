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
const pug = require('gulp-pug');
const gulpAutoprefixer = require('gulp-autoprefixer');
const autoprefixer = require('autoprefixer');
const sassGlob = require('gulp-sass-glob');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const cssSort = require('css-declaration-sorter');
const browserSync = require('browser-sync');
const watch = require('gulp-watch');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

// ------------------------------------------------------------ //
// Tasks
// ------------------------------------------------------------ //

/**
 * JavaScriptをトランスパイル
 * １ファイルにまとめてminify化
 */
const _script = (done) => {
    return gulp.src(`${conf.path.src}**/!(_)*es6`)
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
const _style = (done) => {
    return gulp.src(`${conf.path.src}**/!(_)*.scss`)
    .pipe( plumber({ errorHandler: notify.onError( 'Error: <%= error.message %>' ) }) )
    .pipe( sassGlob() )
    .pipe( sass({ outputStyle: 'expanded' }) )
    .pipe( postcss([ autoprefixer() ]))
    .pipe( postcss([ cssSort({ order: 'alphabetical' }) ]) )
    .pipe(
        gulpStylelint({
        fix: true
        })
    )
    .pipe(gulp.dest(`${conf.path.dist}`))
    .pipe( cleanCss() )
    .pipe( rename({
        suffix: '.min',
    }))
    .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * テーマで使用する画像ファイルを圧縮する
 */
const _images = (done) => {
    return gulp.src(`${conf.path.src}**/*.{jpg,jpeg,png,gif,mp4,svg}`)
    .pipe(imagemin())
    .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * テーマで使用するフォントをコピーする
 */
const _fonts = (done) => {
    return gulp.src(`${conf.path.src}**/*.{woff,woff2,ttf}`)
    .pipe(gulp.dest(`${conf.path.dist}`))
    done();
}

/**
 * ローカルサーバーを起動
 */
const _serve = (done) => {
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
const _sync = (done) => {
    browserSync.reload();
    done();
}

/**
 * ファイルの変更・保存を監視
 */
const _watch = (done) => {
    gulp.watch([`${conf.path.src}**/*.scss`], gulp.series(_style, _sync));
    gulp.watch([`${conf.path.src}**/*.php`], gulp.series(_sync));
    gulp.watch([`${conf.path.src}**/*.es6`], gulp.series(_script, _sync));
    gulp.watch([`${conf.path.src}**/*.{jpg,jpeg,png,gif,mp4,svg}`], gulp.series(_images, _sync));
    gulp.watch([`${conf.path.src}**/*.{woff,woff2,ttf}`], gulp.series(_fonts, _sync));
    done();
}

/**
 * Gulpタスクをデフォルトのコマンドで起動
 * $ npx gulp
 */
gulp.task('default', gulp.series(
    gulp.parallel(_script, _images, _style, _fonts, _watch),
    _serve
));

/**
 * プロジェクト初期設定用ビルドタスク
 * $ npx gulp build
 */
gulp.task('build', gulp.parallel(_script, _images, _style, _fonts));
