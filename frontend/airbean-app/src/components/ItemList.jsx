// import { useEffect, useState } from 'react';
// import { fetchWithAuth } from './api.js';

// export const ItemList = () => {
//     const [items, setItems] = useState([]);

//     useEffect(() => {
//         fetch('http://localhost:4321/items') // eller justera enligt din endpoint
//             .then(res => res.json())
//             .then(data => setItems(data.items || []));
//     }, []);

//     const addToCart = async (item_id) => {
//         const res = await fetchWithAuth('/cart/add', {
//             method: 'POST',
//             body: JSON.stringify({ item_id, quantity: 1 })
//         });

//         const data = await res.json();
//         if (!res.ok) {
//             alert(data.message);
//         } else {
//             alert(`Lade till ${data.addedItem.title}`);
//         }
//     };

//     return (
//         <div>
//             <h2>Produkter</h2>
//             {items.map(item => (
//                 <div key={item._id}>
//                     <h4>{item.title} – {item.price} kr</h4>
//                     <p>{item.desc}</p>
//                     <button onClick={() => addToCart(item._id)}>Lägg i varukorg</button>
//                 </div>
//             ))}
//         </div>
//     );
// };

// import { useEffect, useState } from 'react';
// import { fetchWithAuth } from './api.js';

// export const ItemList = () => {
//     const [items, setItems] = useState([]);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchItems = async () => {
//             try {
//                 const res = await fetch('http://localhost:4321/items');
//                 const data = await res.json();

//                 if (res.ok && data.success) {
//                     setItems(data.data || []);
//                 } else {
//                     setError(data.error || 'Kunde inte hämta produkter');
//                 }
//             } catch (err) {
//                 setError('Något gick fel vid hämtning av produkter.');
//             }
//         };

//         fetchItems();
//     }, []);

//     const addToCart = async (item_id) => {
//         try {
//             const res = await fetchWithAuth('/cart/add', {
//                 method: 'POST',
//                 body: JSON.stringify({ item_id, quantity: 1 })
//             });

//             const data = await res.json();
//             if (!res.ok) {
//                 alert(data.message || 'Kunde inte lägga till i varukorgen');
//             } else {
//                 console.log(`Lade till ${data.addedItem.title} i varukorgen`);
//             }
//         } catch (err) {
//             alert('Fel vid försök att lägga till i varukorg.');
//         }
//     };

//     if (error) return <p style={{ color: 'red' }}>{error}</p>;

//     return (
//         <div>
//             <h2>Produkter</h2>
//             {items.length === 0 ? (
//                 <p>Inga produkter hittades.</p>
//             ) : (
//                 items.map(item => (
//                     <div key={item._id}>
//                         <h4>{item.title} – {item.price} kr</h4>
//                         <p>{item.desc}</p>
//                         <button onClick={() => addToCart(item._id)}>Lägg i varukorg</button>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

import { useEffect, useState } from 'react';
import { fetchWithAuth } from './api.js';
import { toast } from 'react-toastify';

export const ItemList = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4321/items')
            .then(res => res.json())
            .then(data => setItems(data.data || [])); // matchar ditt backend-responsformat
    }, []);

    const addToCart = async (item_id) => {
        const res = await fetchWithAuth('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ item_id, quantity: 1 })
        });

        const data = await res.json();
        if (!res.ok) {
            toast.error(data.message || 'Något gick fel');
        } else {
            toast.success(`Lade till "${data.addedItem.title}" i varukorgen!`);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Produkter</h2>
            {items.map(item => (
                <div key={item._id} style={{
                    border: '1px solid #ddd',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '8px'
                }}>
                    <h4>{item.title} – {item.price} kr</h4>
                    <p>{item.desc}</p>
                    <button onClick={() => addToCart(item._id)}>
                        Lägg i varukorg
                    </button>
                </div>
            ))}
        </div>
    );
};

