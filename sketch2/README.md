eo test
========

Install:
`npm install`

To build the main site use:
`gulp` which will build into dist/public

To watch the site use:
`gulp watch`

To deploy (minifies js and css):
`gulp --production` 

Gulp compiles sass and runs all js through uglify, and browserify. All `html`, `php`, `.htaccess` files in the `src` directory are copied as are all images in `src\img`.