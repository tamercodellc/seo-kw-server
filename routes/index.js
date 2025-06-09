const express = require('express');
const router = express.Router();

const {login} = require('./user/user');

/** login **/
router.post('/', login);

// /** email tracking **/
// router.get('/email/open/:id', (req, res) => {
//     const id = req.params.id;
//
//     const pixel = Buffer.from(
//         'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
//         'base64'
//     );
//     res.setHeader('Content-Type', 'image/gif');
//     res.send(pixel);
// });
//
module.exports = router;

// Start-Process "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe" `
//   -ArgumentList "--remote-debugging-port=9222",
//                 "--user-data-dir=C:\Users\lioan\chrome-debug-test",
//                 "--no-first-run",
//                 "--no-default-browser-check",
//                 "--profile-directory=Profile 1"
