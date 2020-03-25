import "jest"; // librairy jest for use all test functions
import { WrappedFunction } from "firebase-functions-test/lib/main"; // A function that can be called with test data and optional override values for the event context

import { testEnv } from "../configurations/firebase-test"; // use real datas in firebase
import admin from '../config'; // SDK admin for firebase to manages auth, database, storage with no credentials
import { 
    add_new_user,
    remove_user,
    get_user_by_uid,
    feed_create_last_modification,
    feed_delete_last_modification } from "../manage_users"; // All methods for testing

fdescribe("Manage_authentication_users, callable functions : let see if they work", () => { // block test INIT
    let wrappedCreateUser: WrappedFunction;
    let wrappedDeleteUser: WrappedFunction;
    let wrappedGetUser: WrappedFunction;

    beforeAll(() => { // THIS RUN BEFORE ALL TESTS
        wrappedCreateUser = testEnv.wrap(add_new_user);
        wrappedDeleteUser = testEnv.wrap(remove_user);
        wrappedGetUser = testEnv.wrap(get_user_by_uid);
    });
    let uidMock: string;

    it("add user",async() => { // FIRST TEST WHO RUNNING 
        const data = {firstname: "John", lastname: "Cena", email: "johncena@gmail.com"};
        
        const auth = await wrappedCreateUser(data,{});
        expect(auth).not.toBeUndefined();

        uidMock = auth.uid;
       
        const after = await wrappedGetUser(uidMock,{});
        expect(after).toBeTruthy(); // EXPECT EMAIL USER'S CREDENTIALS EXIST
        
    });

    it("Check if user is deleted", async() => { 
        const removeAuth = await wrappedDeleteUser(uidMock,{});
        expect(removeAuth).toBeUndefined();
    });

});

describe("manage_feed, checked last modification of the user",() => {
    let wrappedCreateFeed: WrappedFunction;
    let wrappedDeleteFeed: WrappedFunction;

    beforeAll(() => {
        wrappedCreateFeed = testEnv.wrap(feed_create_last_modification);
        wrappedDeleteFeed = testEnv.wrap(feed_delete_last_modification);
    });

    const context = { auth: { token: {},uid: "rmItrojEWvfrN9ZbtmZp5JlRpMf2" } };
    const data = {};
    
    const path = "feeds/TCEH8M8xhqb8DSWxO737";
    const snap = testEnv.firestore.makeDocumentSnapshot(data,path);
    const docUser = "users/rmItrojEWvfrN9ZbtmZp5JlRpMf2";

    it("for feed created, it update feeds_last_modification key to timestamp",async () => {

        await wrappedCreateFeed(snap,context);

        const after = await admin.firestore().doc(docUser).get();

        expect(after.data()?.feeds_last_modification).not.toBeUndefined();

        const isNumber = Date.parse(
            after.data()?.feeds_last_modification
        );
        expect(isNumber).not.toBeNaN();
    });

    it("for feed deleted, it update feeds_last_modification key to timestamp",async () => {
            
        await wrappedDeleteFeed(snap,context);

        const after = await admin.firestore().doc(docUser).get()

        expect(after.data()?.feeds_last_modification).not.toBeUndefined();

        const isNumber = Date.parse(
            after.data()?.feeds_last_modification
        );
        expect(isNumber).not.toBeNaN();
    });
});