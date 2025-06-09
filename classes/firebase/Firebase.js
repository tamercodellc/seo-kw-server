const firebase = require('firebase-admin');

const serviceAccount = require('./ez-crm-react-firebase-adminsdk-fbsvc-ccc06d87ec');
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
});


console.log('firebase initialized');

module.exports = {
    async createUser(fullName, email, password) {
        try {
            const firebaseUser = await firebase.auth().createUser({
                email: email,
                emailVerified: true,
                password: password,
                displayName: fullName,
                disabled: false,
            })

            return firebaseUser.uid
        } catch (error) {
            return {res: 'error', error}
        }
    },
    async verifyIdToken(idToken) {
        return new Promise(function (resolve, reject) {
            firebase.auth().verifyIdToken(idToken, true)
                .then(function (decodedToken) {
                    resolve(decodedToken);
                })
                .catch((error) => {
                    resolve(error.message);
                });
        });
    }
}
