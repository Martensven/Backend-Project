export const validateData = (requiredFields, typeChecks = {}) => {
    return (req, res, next) => {
        // Kolla om body finns
        if (!req.body) {
            return res.status(400).json({ error: 'No data sent' });
        }

        // Kontrollera obligatoriska fält
        for (let field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // Kontrollera datatyper (JSON)
        for (let [field, type] of Object.entries(typeChecks)) {
            if (req.body[field] && typeof req.body[field] !== type) {
                return res.status(400).json({
                    error: `${field} must be a ${type}`
                });
            }
        }

        next();
    };
};

