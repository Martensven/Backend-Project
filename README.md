# README - Backend API

## Krav för att köra projektet
För att kunna köra detta projekt behöver du följande verktyg och beroenden:

### Verktyg
- [Node.js](https://nodejs.org/) (senaste LTS-version rekommenderas)
- [MongoDB](https://www.mongodb.com/) (antingen lokalt eller via MongoDB Atlas)
- [Postman](https://www.postman.com/) eller [Insomnia](https://insomnia.rest/) för att testa API:et

### Beroenden
- Express.js (backend-ramverk).
- Mongoose (ODM för MongoDB).
- Middleware för validering och autentisering.

## Installation och start

1. **Kloning av projektet**
   ```sh
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Installera beroenden**
   ```sh
   npm install
   ```

3. **Konfigurera miljövariabler**
   - Skapa en `.env`-fil i root-mappen och fyll i nödvändiga variabler, t.ex.:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/din-databas
     JWT_SECRET=din-hemliga-nyckel
     ```

4. **Starta servern**
   ```sh
   npm start
   ```
   Servern körs nu på `http://localhost:5000` (om inget annat anges i `.env`)

## Användning av API:et
Anrop kan göras via Postman eller Insomnia genom att skicka HTTP-requests till servern.

### Endpoints
Alla requests hanteras via `http://localhost:5000`

#### **1. Items (Produkter)**
- **Hämta alla produkter**: `GET /items`
- **Hämta en specifik produkt**: `GET /items/:id`
- **Lägg till en ny produkt**: `POST /items`
- **Uppdatera en produkt**: `PUT /items/:id`
- **Ta bort en produkt**: `DELETE /items/:id`

#### **2. Users (Användare)**
- **Hämta alla användare**: `GET /users`
- **Hämta en specifik användare**: `GET /users/:id`
- **Skapa en ny användare**: `POST /users`
- **Uppdatera en användare**: `PUT /users/:id`
- **Ta bort en användare**: `DELETE /users/:id`

#### **3. Varukorg**
- **Hämta varukorg för en användare**: `GET /varukorg/:userId`
- **Lägg till produkt i varukorg**: `POST /varukorg/:userId`
- **Uppdatera produkt i varukorg**: `PUT /varukorg/:userId/:itemId`
- **Ta bort produkt från varukorg**: `DELETE /varukorg/:userId/:itemId`

## Testning
För att testa API:et kan du använda:
- **Postman**: Skapa en ny `Collection` och lägg till anrop till ovanstående endpoints.
- **Insomnia**: Skapa en ny `Workspace` och definiera endpoints där.
- **cURL**: Kör kommandon i terminalen, t.ex.:
  ```sh
  curl -X GET http://localhost:5000/items
  ```

## Slutord
Se till att ha en aktiv MongoDB-databas och rätt konfigurerade miljövariabler för att API:et ska fungera korrekt. Lycka till med utvecklingen!

