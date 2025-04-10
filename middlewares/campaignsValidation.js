// campaignsValidation.js
export const calculateCampaigns = (items) => {
    const now = new Date();
    const juneEnd = new Date(now.getFullYear(), 5, 30); // June is month 5 (0-indexed)
    
    let totalDiscount = 0;
    const appliedCampaigns = [];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. 10% summer discount (until June 30)
    if (now <= juneEnd) {
        const discount = subtotal * 0.1;
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "Sommarrabatt 10% (t.o.m. 30 juni)",
            discount: discount,
            type: "percentage"
        });
    }

    // 2. 50 SEK discount for 5+ items
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 5) {
        totalDiscount += 50;
        appliedCampaigns.push({
            name: "Rabatt på storköp (50 kr för 5+ varor)",
            discount: 50,
            type: "fixed"
        });
    }

    // 3. 10 SEK discount per "Bryggkaffe"
    const coffeeItems = items.filter(item => 
        item.title.toLowerCase().includes('bryggkaffe')
    );
    if (coffeeItems.length > 0) {
        const discount = coffeeItems.reduce((sum, item) => sum + (10 * item.quantity), 0);
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "10 kr rabatt på bryggkaffe",
            discount: discount,
            type: "item_discount"
        });
    }

    return {
        subtotal,
        grandTotal: Math.max(0, subtotal - totalDiscount),
        totalDiscount,
        appliedCampaigns
    };
};