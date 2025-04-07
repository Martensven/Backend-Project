import { Link } from "react-router-dom";

const Header = () => {
    return (
        <nav>
            <ul>
                <Link to="/"><button>Home</button></Link>
                <Link to="/items"><button>Items</button></Link>
                <Link to="/order"><button>Order</button></Link>
                <Link to="/login"><button>Login</button></Link>
                <Link to="/register"><button>Register</button></Link>
            </ul>
        </nav>
    );
};

export default Header;