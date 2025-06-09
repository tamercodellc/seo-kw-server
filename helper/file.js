const fs = require("fs");
const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../classes/email');

module.exports = {
    readFile: (fileName) => {
        return new Promise((resolve, reject) => {
            fs.readFile(`${BASE_PATH}/${fileName}`, 'utf8', (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
    }
}