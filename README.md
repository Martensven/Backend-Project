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
   git clone <https://github.com/Martensven/Backend-Project.git>
   cd <BACKEND-PROJEKT>
   ```

2. **Installera beroenden**
   ```sh
   init -y

   npm install express mongoose bcryptjs jsonwebtoken dotenv express-session

   ```

4. **Starta servern**
   ```sh
   npm start
   ```

### Endpoints
Alla requests hanteras via `http://localhost:4321`

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
##  Autentisering

Autentisering sker via **JWT tokens**. Vid inloggning får klienten en token som skickas med som header i skyddade endpoints (om sådana finns):

```
Authorization: Bearer <JWT-token>
```

---

##  Endpoints

###  POST `/register`

Registrera en ny användare.

#### Request Body

```json
{
  "first_name": "Mårten",
  "last_name": "Mårtensson",
  "email": "marten@example.com",
  "street": "Mårtengatan 1",
  "zip_code": "12345",
  "city": "Stockholm",
  "password": "Mårten"
}
```

#### Responses

| Status | Beskrivning                             |
|--------|-----------------------------------------|
| 201    | ✅ Användare skapad                    |
| 400    | ❌ Saknade fält / E-post används redan |
| 500    | ❌ Serverfel vid skapande              |

---

###  POST `/login`

Logga in en användare och få en JWT-token.

#### Request Body

```json
{
  "email": "marten@example.com",
  "password": "Mårten"
}
```

#### Responses

| Status | Beskrivning                          |
|--------|-------------------------------------|
| 200    | ✅ Inloggning lyckades + token       |
| 400    | ❌ Saknad e-post eller lösenord      |
| 401    | ❌ Felaktiga inloggningsuppgifter    |
| 500    | ❌ Serverfel                         |

#### Response Example

```json
{
  "message": "Login successful",
  "token": "<JWT-token>"
}
```

#### **3. Varukorg**

**Endpoint:**  
`POST /cart/add`  
Lägger till en vara i varukorgen.

**Request:**

```
POST /cart/add
Content-Type: application/json

{
  "item_id": "<itemIdNr>",
  "quantity": <amountNr>
}
```

#### Responses

| Status | Beskrivning                           |
|--------|---------------------------------------|
| 200    | Item successfully added to the cart   |
| 400    | Missing item ID or quantity          |
| 401    | Item not found                        |
| 500    | Server error                          |

#### Response Example

````json
{
  "message": "Item added to cart",
  "cart": {
    "items": [
      {
        "_id": "607f1f77bcf86cd799439011",
        "title": "Bryggkaffe",
        "price": 39,
        "desc": "Bryggd på månadens bönor.",
        "quantity": 2,
        "totalPrice": 78
      }
    ],
    "grandTotal": 78
  }
}
````

**Hämta varukorgen**

**Endpoint:**  
`GET /cart/`  
Hämtar den nuvarande varukorgen för en användare eller gäst.

**Request:**

```
GET /cart/
```

#### Responses

| Status | Beskrivning                         |
|--------|-------------------------------------|
| 200    | Successfully retrieved cart data    |
| 404    | Cart not found                      |
| 500    | Server error                        |

#### Response Example

````json
{
  "cart": {
    "items": [
      {
        "_id": "607f1f77bcf86cd799439011",
        "title": "Bryggkaffe",
        "price": 39,
        "desc": "Bryggd på månadens bönor.",
        "quantity": 2,
        "totalPrice": 78
      }
    ],
    "grandTotal": 78
  }
}
````

**Ta bort en vara från varukorgen**

**Endpoint:**  
`POST /cart/remove`  
Tar bort eller minskar kvantiteten av en vara i varukorgen.

**Request:**

```
POST /cart/remove
Content-Type: application/json

{
  "item_id": "<itemIdNr>"
}
```

#### Responses

| Status | Beskrivning                                |
|--------|--------------------------------------------|
| 200    | Item quantity updated or removed from cart |
| 400    | Missing item ID                            |
| 404    | Cart or item not found                     |
| 500    | Server error                               |

#### Response Example

````json
{
  "message": "Item quantity updated",
  "cart": {
    "items": [
      {
        "_id": "607f1f77bcf86cd799439011",
        "title": "Bryggkaffe",
        "price": 39,
        "desc": "Bryggd på månadens bönor.",
        "quantity": 1,
        "totalPrice": 39
      }
    ],
    "grandTotal": 39
  }
}
````
#### **4. Order**


#### **5. About**
- **Skapa ny about**: `POST /`
- **Hämta about**: `GET /`
- **Hämta specifik about entry**: `GET /:id`
- **Uppdatera specifik about entry**: `PUT /:id`
- **Radera specifik about entry**: `DELETE /:id`

- **Ta bort produkt från varukorg**: `DELETE /:userId/:itemId`

## Testning
Anrop kan göras via Postman,Insomnia eller annan valfri tjänst genom att skicka HTTP-requests till servern.
För att testa API:et kan du använda:
- **Postman**: Skapa en ny `Collection` och lägg till anrop till ovanstående endpoints.
- **Insomnia**: Skapa en ny `Workspace` och definiera endpoints där.


