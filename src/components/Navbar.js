import { useContext } from "react";
import { Menu as Nav, Icon, Button } from "element-react";
import { NavLink } from "react-router-dom";
import { SiAwsamplify } from "react-icons/si";
import { UserContext } from "../contexts/UserContext";

const Navbar = () => {
    const { user, signOut } = useContext(UserContext);

    return (
        <Nav mode="horizontal" theme="dark" defaultActive="1">
            <div className="nav-container">
                {/* App Title / Icon */}
                <Nav.Item index="1">
                    <NavLink to="/" className="nav-link">
                        <span className="app-title">
                            <SiAwsamplify
                                className="icon"
                                size={30}
                                color="orange"
                            />
                            AmplifyAgora
                        </span>
                    </NavLink>
                </Nav.Item>

                {/* Navbar Items */}
                <div className="nav-items">
                    <Nav.Item index="2">
                        <span className="app-user">Hello, {user.username}</span>
                    </Nav.Item>
                    <Nav.Item index="3">
                        <NavLink to="/profile" className="nav-link">
                            <Icon name="setting" />
                            Profile
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item index="4">
                        <Button type="warning" onClick={() => signOut()}>
                            Sign Out
                        </Button>
                    </Nav.Item>
                </div>
            </div>
        </Nav>
    );
};

export default Navbar;
