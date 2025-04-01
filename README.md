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

##### **1.1 Hämta alla produkter**: 

**Request** `GET /items`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 500 Internal Server Error - Om något oväntat går fel

##### **1.2 Hämta en specifik produkt**: 

**Request** `GET /items/:id`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om Item inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **1.3 Lägg till en ny produkt**:

**Request** `POST /items`

JSON Body:
```
{
   "Exempel": Exempel
}
```

**Response**
```
{
   "Exempel": Exmepel
}
```
**Felhantering**
- 400 Bad Request - Om något inom JSON body saknas
- 500 Internal Server Error - Om något oväntat går fel

##### **1.4 Uppdatera en produkt**: 

**Request** `PUT /items/:id`

JSON Body: 
```
{
   "Exempel": Exempel, 
   "Exempel1": Exempel 1
}
```

**Response**
```
{
   "Exempel": Exmepel
   "Exempel1": Exempel 1
}
```
**Felhantering**
- 404 Not Found - Om item inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **1.5 Ta bort en produkt**: 

**Request** `DELETE /items/:id`

**Response**
```
[
   {
      "message": "Item with ID [exempelID] has been deleted"
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om item inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

#### **2. Users (Användare)**

##### **2.1 Hämta alla användare**: 

**Request** `GET /users`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 500 Internal Server Error - Om något oväntat går fel

##### **2.2 Hämta en specifik användare**: 

**Request** `GET /users/:id`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om användaren inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **2.3 Skapa en ny användare**: 

**Request** `POST /users`

JSON Body:  
```
{
   "Exempel": Exempel
}
```

**Response**
```
{
   "Exempel": Exmepel
}
```
**Felhantering**
- 400 Bad Request - Om något inom JSON body saknas
- 500 Internal Server Error - Om något oväntat går fel

##### **2.4 Uppdatera en användare**: 

**Request** `PUT /users/:id`

JSON Body:
```
{
   "Exempel": Exempel
   "Exempel1": Exempel1
}
``` 

**Response**
```
{
   "Exempel": Exmepel
   "Exempel1": Exempel 1
}
```
**Felhantering**
- 404 Not Found - Om användaren inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **2.5 Ta bort en användare**: 

**Request** `DELETE /users/:id`

**Response**
```
[
   {
      "message": "User deleted successfully"
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om användaren inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

#### **3. Varukorg**

##### **3.1 Hämta varukorg för en användare**: 

**Request** `GET /varukorg/:userId`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 500 Internal Server Error - Om något oväntat går fel

##### **3.2 Lägg till produkt i varukorg**: 

**Request** `POST /varukorg/:userId`

JSON Body:
```
{
   "Exempel": Exempel
}
```

**Response**
```
{
   "Exempel": Exmepel
}
```
**Felhantering**
- 400 Bad Request - Om något inom JSON body saknas
- 500 Internal Server Error - Om något oväntat går fel

##### **3.3 Uppdatera produkt i varukorg**: 

**Request** `PUT /varukorg/:userId/:itemId`

JSON Body:
```
{
   "Exempel": Exempel
   "Exempel1": Exempel1
}
```

**Response**
```
{
   "Exempel": Exmepel
   "Exempel1": Exmepel1
}
```
**Felhantering**
- 404 Not Found - Om produkten inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **3.4 Ta bort produkt från varukorg**: 

**Request** `DELETE /varukorg/:userId/:itemId`

**Response**
```
[
   {
      "message": "User deleted successfully"
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om produkten inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel


#### **4. Orders**

##### **4.1 Hämtar items from cart.js genom en specifik user id:** 

**Request** `POST /orders/:userId`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 404 Not Found - Om cart inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

##### **4.2 Visar upp den specifika datan från user id :** 

**Request** `GET /orders/:userId`

**Response**
```
[
   {
      "Exempel": Exmepel
   }
]
```
**Felhantering**
- 400 Bad Request - Om något med userId saknas
- 404 Not Found - Om användaren inte finns eller hittas
- 500 Internal Server Error - Om något oväntat går fel

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

