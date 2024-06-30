const { src, dest } = require('gulp');
const concat = require('gulp-concat');

const jsBundle = () =>
    src([
        'src/superxmlparser74.js',
        'src/dombuilder.js',
        'src/template.js',
        'src/dependency/page.js',
        'src/render.js'
    ])
        .pipe(concat('mreact.js'))
        .pipe(dest('dist'));

jsBundle();