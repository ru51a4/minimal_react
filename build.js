const { src, dest } = require('gulp');
const concat = require('gulp-concat');

const jsBundle = () =>
    src([
        'lib/superxmlparser74.js',
        'lib/dombuilder.js',
        'lib/template.js',
        'lib/dependency/page.js',
        'lib/render.js'
    ])
        .pipe(concat('mreact.js'))
        .pipe(dest('dist'));

jsBundle();