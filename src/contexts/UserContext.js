import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { createContext, useEffect, useState } from "react";
import { registerUser } from "../graphql/mutations";
import { getUser } from "../graphql/queries";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [authState, setAuthState] = useState();
    const [user, setUser] = useState();

    async function onAppLoad() {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
        setAuthState("signedin");
    }

    async function signOut() {
        await Auth.signOut();
    }

    const createUser = async (userData) => {
        const { sub: userId } = userData.attributes;

        const user = await API.graphql(
            graphqlOperation(getUser, { id: userId })
        );

        if (user.data.getUser) {
            console.log("user already exists");
            return;
        }

        const { email, email_verified } = userData.attributes;

        const userObj = {
            id: userId,
            email,
            username: userData.username,
            registered: email_verified,
        };

        const newUser = await API.graphql(
            graphqlOperation(registerUser, { input: userObj })
        );
        console.log("new user:", newUser.data.registerUser);
    };

    useEffect(() => {
        onAppLoad();

        Hub.listen("auth", (data) => {
            const event = data.payload.event;
            console.log("event:", event);
            if (event === "signOut") {
                setAuthState("signedout");
                setUser(null);
            } else if (event === "signIn") {
                createUser(data.payload.data);
                onAppLoad();
            }
        });
    }, []);

    // useEffect(() => {
    //     return onAuthUIStateChange((nextAuthState, authData) => {
    //         setAuthState(nextAuthState);
    //         setUser(authData);
    //     });
    // }, []);

    return (
        <UserContext.Provider value={{ user, signOut, authState }}>
            {children}
        </UserContext.Provider>
    );
};
