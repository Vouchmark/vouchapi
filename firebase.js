const { json } = require("express");
const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} = require("firebase/database");
let app;
let database;

const firebaseConfig = {
  apiKey: "AIzaSyBLM71sSzL_5uJ1II_xBmzyyy2P8kX1akE",
  authDomain: "vouchmark-412cc.firebaseapp.com",
  databaseURL: "https://vouchmark-412cc-default-rtdb.firebaseio.com",
  projectId: "vouchmark-412cc",
  storageBucket: "vouchmark-412cc.appspot.com",
  messagingSenderId: "897036315274",
  appId: "1:897036315274:web:9c4bbaf7d34826f6111b73",
  measurementId: "G-G52QM0P6VB",
};

const initializeFirebaseApp = () => {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase();
    return app;
  } catch (error) {}
};
initializeFirebaseApp();

const uploadProcessedData = async (data) => {
  try {
    const dataRef = ref(database, "vouch_companies/" + data.rc_number);
    await set(dataRef, data);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getTheData = async (searchId) => {
  let data;
  try {
    const dataRef = ref(database, "vouch_companies");
    dataSnap = await get(
      query(dataRef, orderByChild("rc_number"), equalTo(searchId))
    );
    let searchData = [];

    if (!dataSnap.exists()) {
      const nameDataSnap = await get(
        query(dataRef, orderByChild("approved_name"))
      );

      Object.values(nameDataSnap.val()).forEach((data) => {
        if (data.approved_name.toLowerCase().includes(searchId.toLowerCase())) {
          // console.log(`Logging data 1 ${JSON.stringify(data)}`);
          searchData.push(data);
          console.log("------------------------------------------------------");
          console.log(searchData);
          return JSON.stringify(searchData);
        } else {
          return false;
        }
      });
    } else {
      data = dataSnap.val();
    }
    return JSON.stringify(searchData);
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  initializeFirebaseApp,
  uploadProcessedData,
  getTheData,
};
