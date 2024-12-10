const { src, dest } = require('gulp');
const concat = require('gulp-concat');

const jsBundle = () =>
    src([
        'src/superxmlparser74.js',
        'src/dombuilder.js',
        'src/template.js',
        'src/render.js'
    ])
        .pipe(concat('rrender.js'))
        .pipe(dest('dist'));

jsBundle();