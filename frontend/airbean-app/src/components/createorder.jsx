import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './api';
import { toast } from 'react-toastify';

export const CreateOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const cart = location.state?.cart || null; // Säkerställ att cart alltid finns
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!cart) {
        return <p>Ingen varukorg hittades. Vänligen gå tillbaka och försök igen.</p>;
    }

    const createOrder = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.originalItems.map(item => ({
                        item_id: item.item_id._id,
                        title: item.item_id.title,
                        description: item.item_id.desc, // Säkerställ att backend använder rätt fält
                        quantity: item.quantity,
                        price: item.item_id.price,
                    })),
                    total_price: cart.newPrice,
                    original_price: cart.originalPrice,
                    discount_applied: cart.totalDiscount,
                    applied_campaigns: cart.appliedCampaigns,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Order skapad framgångsrikt!');
                navigate('/orders'); // Omdirigera användaren till orderhistorik
            } else {
                toast.error(data.message || 'Kunde inte skapa order');
            }
        } catch (error) {
            setError('Något gick fel vid skapandet av order');
            toast.error('Något gick fel vid skapandet av order');
            console.error('Order creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Skapa Order</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>Varor i din order:</h3>
            <ul>
                {cart.originalItems.map(item => (
                    <li key={item._id}>
                        <strong>{item.item_id.title}</strong><br />
                        {item.quantity} st - {item.item_id.price * item.quantity} kr
                    </li>
                ))}
            </ul>



            {/* Kampanjer */}
            {cart.appliedCampaigns?.length > 0 && (
                <>
                    <h4>Kampanjer:</h4>
                    <ul>
                        {cart.appliedCampaigns.map((c, i) => (
                            <li key={i}>{c.name} (−{c.discount} kr)</li>
                        ))}
                    </ul>
                </>
            )}

            <p>Ordinarie pris: {cart.originalPrice} kr</p>
            <p>Rabatt: -{cart.totalDiscount} kr</p>
            <p><strong>Att betala: {cart.newPrice} kr</strong></p>

            <button onClick={createOrder} disabled={loading}>
                {loading ? 'Skapar order...' : 'Bekräfta Order'}
            </button>
        </div>
    );
};