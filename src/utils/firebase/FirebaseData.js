import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/messaging";
import { onMessage,} from 'firebase/messaging';
import { useSelector } from "react-redux";
import Loader from "../../components/loader/Loader";

const FirebaseData = () => {

  const setting = useSelector((state) => state.setting);


  if (setting.setting === null) {
    return <Loader screen='full' />;
  }

  const apiKey = setting.setting && setting.setting.firebase.apiKey;
  const authDomain = setting.setting && setting.setting.firebase.authDomain;
  const projectId = setting.setting && setting.setting.firebase.projectId;
  const storageBucket = setting.setting && setting.setting.firebase.storageBucket;
  const messagingSenderId = setting.setting && setting.setting.firebase.messagingSenderId;
  const appId = setting.setting && setting.setting.firebase.appId;
  const measurementId = setting.setting && setting.setting.firebase.measurementId;


  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId,
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }
  firebase.messaging()
  const auth = firebase.auth();

  const messaging = firebase.messaging();
  
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // ...
  });
 
  return { auth, firebase, messaging };
};

export default FirebaseData;