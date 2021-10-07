import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState } from "@aws-amplify/ui-components";
import { Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
import "./App.css";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";

function App() {
    const { user, authState } = useContext(UserContext);

    return authState === AuthState.SignedIn && user ? (
        <>
            <Navbar />

            <div className="app-container">
                <Route exact path="/" component={HomePage} />
                <Route exact path="/profile" component={ProfilePage} />
                <Route exact path="/markets/:marketId" component={MarketPage} />
            </div>
        </>
    ) : (
        <AmplifyAuthenticator />
    );
}

export default App;
