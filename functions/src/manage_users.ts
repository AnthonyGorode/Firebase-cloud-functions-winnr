import * as functions from 'firebase-functions';

import admin from './config';

const db = admin.firestore();
const admin_auth = admin.auth();
const auth = functions.auth;

interface User {
    firstname: string;
    lastname: string;
    email: string;
}

export const get_user_by_uid = functions.https.onCall((uid: string,context) => {
    return db.doc(`users/${uid}`).get();
})

export const add_new_user = functions.https.onCall(async(user: User ,context) => {
    const { firstname,lastname,email } = user;
    
    return admin_auth.createUser({
        email,
        emailVerified: false,
        password:"password",
        displayName: `${lastname} / ${firstname}`,
        disabled: false
    });
});

export const remove_user = functions.https.onCall(async(uid: string,context) => {
    return admin_auth.deleteUser(uid);
});

export const create_user_record = auth
    .user()
    .onCreate(async (user,context) => {
        const ref = db.doc(`users/${user.uid}`);
        const fullname = user.displayName?.split(" / ");
        let lastname, firstname;
        if(fullname) {
            lastname = fullname[0];
            firstname = fullname[1];
        }

        return ref.set({
            lastname,
            firstname,
            email: user.email,
            feeds: [],
            created_at: context.timestamp,
            role: "user",
            feed_last_modification: ""
        });
    })
;

export const delete_user_record = auth
    .user()
    .onDelete((user, context) => {
        const ref = db.doc(`users/${user.uid}`);
        return ref.delete();
    })
;

export const feed_create_last_modification = functions.firestore
    .document(`feeds/{uid}`)
    .onCreate((snapshot,context) => {
        // let uid = "";
        const uid = context.auth?.uid;
        // console.log("HERE => ",uid);
        
        const userRef = db.doc(`users/${uid}`);

        return userRef.update({
            feeds_last_modification: context.timestamp
        });
    })
;

export const feed_delete_last_modification = functions.firestore
    .document(`feeds/{uid}`)
    .onDelete((snapshot,context) => {
        console.log(context.auth);
        const uid = context.auth?.uid;
        
        const userRef = db.doc(`users/${uid}`);

        return userRef.update({
            feeds_last_modification: context.timestamp
        });
    })
;