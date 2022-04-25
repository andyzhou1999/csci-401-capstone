/* wrap npm module you want to use in client side in this file
 * then run command: browserify main.js -o bundle.js
 * then copy bundle.js to public folder
 * you are finally allowed to use these npm modules by include script in your front-end html and use window object.
 */
const saveAs = require('file-saver');
const quillToWord = require('quill-to-word');
global.window.saveAs = saveAs;
global.window.quillToWord = quillToWord;