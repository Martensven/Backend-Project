import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate(); // Använd useNavigate för att navigera inom React Router

    const logout = () => {
        // Ta bort JWT-token från localStorage
        localStorage.removeItem('token');
        // Använd navigate för att omdirigera till login-sidan med React Router
        navigate('/login');
    };

    const isLoggedIn = localStorage.getItem('token') !== null;

    return (
        <nav>
            <ul>
                <Link to="/"><button>Home</button></Link>
                <Link to="/items"><button>Items</button></Link>
                <Link to="/cart"><button>Cart</button></Link>
                <Link to="/orders"><button>Orders</button></Link>
                <Link to="/session-tester"><button>Session-tester</button></Link>

                {/* Visa Login om användaren inte är inloggad */}
                {!isLoggedIn ? (
                    <Link to="/login"><button>Login</button></Link>
                ) : (
                    // Visa Logout om användaren är inloggad
                    <button onClick={logout}>Logout</button>
                )}
            </ul>
        </nav>
    );
};

export default Header;