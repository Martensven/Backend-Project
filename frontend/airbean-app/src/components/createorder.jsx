import { useSelector } from 'react-redux';

export const CreateOrder = () => {
    const cart = useSelector((state) => state.cart);

    if (!cart || cart.items.length === 0) {
        return <p>Ingen varukorg hittades. Vänligen gå tillbaka och försök igen.</p>;
    }

    // Skapa order-logik här
    return (
        <div>
            <h2>Skapa Order</h2>
            <p>Här är din varukorg:</p>
            {/* Visa varukorgens innehåll och fortsätt med orderflödet */}
        </div>
    );
};