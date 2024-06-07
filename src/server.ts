import { httpServer } from "./index";
import dotenv from "dotenv";
import path from "path";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
let server: any;
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

const fire = async() =>{
    const fireApp = initializeApp(firebaseConfig);
}

fire().then(()=>{
    server = httpServer.listen(process.env.PORT, () => {
        console.log(`⚡️[Server]: Listening on port ${process.env.PORT}`);
    });
})


const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    console.log(message);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
        server.close();
    }
});
