import { NextFunction, Request, Response } from "express";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    } catch (err) {
        next(err);
    }

}


export { signup}