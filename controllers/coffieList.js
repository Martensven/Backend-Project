const fs = require('fs');
const path = require('path');


const menuFilePath = path.join(__dirname, '../data/menu.json');

const getCoffeeMenu = (req, res) => {
    fs.readFile(menuFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the JSON file:', err);  // Loggar felet i terminalen
        return res.status(500).json({
          success: false,
          message: 'Kunde inte läsa JSON-filen. Kontrollera sökvägen eller filens innehåll.',
        });
      }
  
      const coffeeMenu = JSON.parse(data);
      res.status(200).json({
        success: true,
        data: coffeeMenu,
      });
    });
  };
  
  module.exports = { getCoffeeMenu };
