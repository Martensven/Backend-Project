# README - Backend API

## Krav för att köra projektet
För att kunna köra detta projekt behöver du följande verktyg och beroenden:

### Verktyg
- [Node.js](https://nodejs.org/) (senaste LTS-version rekommenderas)
- [MongoDB](https://www.mongodb.com/) (antingen lokalt eller via MongoDB Atlas)
- [Postman](https://www.postman.com/) eller [Insomnia](https://insomnia.rest/) för att testa API:et

### Webbsockets
Om vi använde oss utav websockets så skulle vi implementera en funktion för orderhantering där man har en nedräkning i realtid som kan ändras baserat på olika saker
T.ex om det ligger flera orders pending så höjer den tiden.

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
   npm init -y

   npm install express mongoose bcryptjs jsonwebtoken dotenv express-session cors

   ```

4. **Starta servern**
   ```sh
   npm start
   ```

### Endpoints
Alla requests hanteras via `http://localhost:4321`

#### **1. Items (Produkter)**

- **Hämta alla produkter**: `GET /items`
- **Hämta en specifik produkt med primär nyckel**: `GET /items/:id`
- **Hämta en specifik produkt med id**: `GET /by-number/:id`
**Response**
```
"success": true,
    "count": 6,
    "data": [
        {
            "_id": "67e5e2ffde5e397a40ab0842",
            "id": 1,
            "title": "Bryggkaffe",
            "desc": "Bryggd på månadens bönor.",
            "price": 39,
            "createdAt": "2025-04-01T23:10:31.949Z"
        },
    ]
```
**Felhantering**
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

**Request user/guest:**
```
POST http://localhost:4321/cart/add
Content-Type: application/json
Authorization: Bearer JTW-TOKEN-HERE

{
    "item_id": "<itemIdNr>",
    "quantity": <amountNr>
}
```
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
    "addedItem": {
        "_id": "67e9c583c59ec5d540d89ada",
        "title": "Cortado",
        "price": 39,
        "quantity": 2
    },
}
````

**Hämta varukorgen**

**Endpoint:**  
`GET /cart/`  
Hämtar den nuvarande varukorgen för en användare eller gäst.

**Request user/guest:**
```
GET /cart/
Authorization: Bearer JTW-TOKEN-HERE
```
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
                "_id": "67e5e2ffde5e397a40ab0842",
                "id": 1,
                "title": "Bryggkaffe",
                "desc": "Bryggd på månadens bönor.",
                "price": 39,
                "quantity": 5,
                "totalPrice": 195
            }
        ],
        "totalDiscount": 69.5,
        "appliedCampaigns": [
            {
                "name": "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
                "discount": 19.5,
                "type": "percentage"
            },
            {
                "name": "10 kr rabatt på bryggkaffe",
                "discount": 50,
                "type": "item_discount"
            }
        ],
		 "originalPrice": 195,
         "newPrice": 125.5,
    }
}
````

**Ta bort en vara från varukorgen**

**Endpoint:**  
`POST /cart/remove`  
Tar bort eller minskar kvantiteten av en vara i varukorgen.

**Request user/guest:**
```
POST http://localhost:4321/cart/remove
Content-Type: application/json
Authorization: Bearer JTW-TOKEN-HERE

{
  "item_id": "<itemIdNr>"
}
```
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
    "success": true,
    "message": "Successfully removed 1 item",
    "removedItem": {
        "_id": "67e9c583c59ec5d540d89ad7",
        "title": "Cappuccino",
        "quantityRemoved": 1,
        "remainingQuantity": 1
    },
}
````
#### **4. Order**

**POST: Skapa ny Order**

**Header: (Behövs inte om du ska göra som session guest)**
- Authorization: Bearer [din jwt token]

**Request:**
```
Post /orders
```

**Response Example:**
```
{
	"message": "Order created successfully",
	"order": {
		"user_id": "67eeeba2844a3b8734e7b155" || null (om du är session guest),
		"total_price": 479.2,
		"original_price": 588,
		"discount_applied": 108.80000000000001,
		"applied_campaigns": [
			{
				"name": "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
				"discount": 58.800000000000004,
				"type": "percentage",
				"_id": "67f5653947c676a8250b3b91"
			},
			{
				"name": "Rabatt på storköp (50 kr för 5+ varor)",
				"discount": 50,
				"type": "fixed",
				"_id": "67f5653947c676a8250b3b92"
			}
		],
		"delivery_time": "8 hours",
		"status": "Pending",
		"items": [
			{
				"item_id": "67e9c583c59ec5d540d89ad8",
				"title": "Latte Macchiato",
				"quantity": 12,
				"_id": "67f5653947c676a8250b3b93"
			}
		],
		"_id": "67f5653947c676a8250b3b90",
		"created_at": "2025-04-08T18:04:41.922Z",
		"__v": 0
	}
}
``` 

****

**Status Responses:**
| Status | Beskrivning                                |
|--------|--------------------------------------------|
| 201    | Order created successfully                 |
| 400    | Cart is empty                              |
| 500    | Internal Server error                      |

**GET: Hämta Order List från en specifik userId**

**Header**
- Authorization: Bearer [din jwt token]

**Request:**
```
GET /orders/history/user
```

**Response Example:**
```
[
	{
		"_id": "67f5653947c676a8250b3b90",
		"user_id": "67eeeba2844a3b8734e7b155",
		"total_price": 479.2,
		"original_price": 588,
		"discount_applied": 108.80000000000001,
		"applied_campaigns": [
			{
				"name": "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
				"discount": 58.800000000000004,
				"type": "percentage",
				"_id": "67f5653947c676a8250b3b91"
			},
			{
				"name": "Rabatt på storköp (50 kr för 5+ varor)",
				"discount": 50,
				"type": "fixed",
				"_id": "67f5653947c676a8250b3b92"
			}
		],
		"delivery_time": "8 hours",
		"status": "Cancelled",
		"items": [
			{
				"item_id": {
					"_id": "67e9c583c59ec5d540d89ad8",
					"id": 4,
					"title": "Latte Macchiato",
					"desc": "Bryggd på månadens bönor.",
					"price": 49,
					"createdAt": "2025-04-08T18:22:10.330Z"
				},
				"title": "Latte Macchiato",
				"quantity": 12,
				"_id": "67f5653947c676a8250b3b93"
			}
		],
		"created_at": "2025-04-08T18:04:41.922Z",
		"__v": 0
	}
]
```

**Status Responses:**
| Status | Beskrivning                                |
|--------|--------------------------------------------|
| 200    | Order found vis userId                     |
| 400    | Invalid user ID                            |
| 404    | No orders found for this user              |
| 500    | Internal Server error                      |

**GET: Hämta Order List från Order ID**

**Request:**
```
GET /orders/history/:orderId
```

**Response Example:**
```
{
	"_id": "67f5653947c676a8250b3b90",
	"user_id": "67eeeba2844a3b8734e7b155",
	"total_price": 479.2,
	"original_price": 588,
	"discount_applied": 108.80000000000001,
	"applied_campaigns": [
		{
			"name": "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
			"discount": 58.800000000000004,
			"type": "percentage",
			"_id": "67f5653947c676a8250b3b91"
		},
		{
			"name": "Rabatt på storköp (50 kr för 5+ varor)",
			"discount": 50,
			"type": "fixed",
			"_id": "67f5653947c676a8250b3b92"
		}
	],
	"delivery_time": "8 hours",
	"status": "Cancelled",
	"items": [
		{
			"item_id": {
				"_id": "67e9c583c59ec5d540d89ad8",
				"id": 4,
				"title": "Latte Macchiato",
				"desc": "Bryggd på månadens bönor.",
				"price": 49,
				"createdAt": "2025-04-08T18:31:14.916Z"
			},
			"title": "Latte Macchiato",
			"quantity": 12,
			"_id": "67f5653947c676a8250b3b93"
		}
	],
	"created_at": "2025-04-08T18:04:41.922Z",
	"__v": 0
}
```

**Status Responses:**
| Status | Beskrivning                                |
|--------|--------------------------------------------|
| 200    | Order found vis orderId                    |
| 400    | Invalid order ID                           |
| 404    | Order list not found                       |
| 500    | Internal Server error                      |

**PUT: Byta status för Order List**

**Header**
- Authorization: Bearer [din jwt token]**

**Request:**
```
PUT /orders/status/:orderId

BODY JSON:
{
    "status": "Cancelled" eller "Completed"
}
```

**Response Example:**
```
{
	"message": "Order status has updated successfully",
	"order": {
		"_id": "67f5653947c676a8250b3b90",
		"user_id": "67eeeba2844a3b8734e7b155",
		"total_price": 479.2,
		"original_price": 588,
		"discount_applied": 108.80000000000001,
		"applied_campaigns": [
			{
				"name": "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
				"discount": 58.800000000000004,
				"type": "percentage",
				"_id": "67f5653947c676a8250b3b91"
			},
			{
				"name": "Rabatt på storköp (50 kr för 5+ varor)",
				"discount": 50,
				"type": "fixed",
				"_id": "67f5653947c676a8250b3b92"
			}
		],
		"delivery_time": "8 hours",
		"status": "Cancelled",
		"items": [
			{
				"item_id": "67e9c583c59ec5d540d89ad8",
				"title": "Latte Macchiato",
				"quantity": 12,
				"_id": "67f5653947c676a8250b3b93"
			}
		],
		"created_at": "2025-04-08T18:04:41.922Z",
		"__v": 0
	}
}
```

**Status Responses:**
| Status | Beskrivning                                             |
|--------|---------------------------------------------------------|
| 200    | Order status has updated successfully                   |
| 400    | Invalid status, must be "Completed" or "Cancelled"      |
| 404    | Order list not found                                    |
| 500    | Internal Server error                                   |

#### **5. About**
- **Skapa ny about**: `POST /`
**Request:**

```
POST /about

{
    "title": "AirBean Kaffe",
    "content": "Bästa kaffet i Kyh"
}
```
#### Response Example

````json
{
    "title": "AirBean Kaffe",
    "content": "Bästa kaffet i Kyh",
    "_id": "67f409d2089dd37508756370",
    "__v": 0
}
````
- **Hämta about**: `GET /`
**Request:**

```
http://localhost:4321/about
```
#### Response Example
```json
[
    {
        "_id": "67f3effb8e82a6806331f984",
        "title": "EarBeanKaffe",
        "content": "bezda gaffe i zdan!",
        "__v": 0
    },
    {
        "_id": "67f409d2089dd37508756370",
        "title": "AirBean Kaffe",
        "content": "Bästa kaffet i Kyh",
        "__v": 0
    }
]
```
- **Hämta specifik about entry**: `GET /:id`
**Request:**
```
http://localhost:4321/about/67f409d2089dd37508756370
```
#### Response Example
```json
{
    "_id": "67f409d2089dd37508756370",
    "title": "AirBean Kaffe",
    "content": "Bästa kaffet i Kyh",
    "__v": 0
}
```
- **Uppdatera specifik about entry**: `PUT /:id`
**Request:**
```
http://localhost:4321/about/67f409d2089dd37508756370
```
#### Response Example
```json
{
    "message": "Uppdatering lyckades, nya versionen är:",
    "updated": {
        "_id": "67f409d2089dd37508756370",
        "title": "AirBean Kaffe",
        "content": "Sämsta kaffet i Kyh!",
        "__v": 0
    }
}
```
- **Radera specifik about entry**: `DELETE /:id`
**Request:**
```
http://localhost:4321/about/67f3effb8e82a6806331f984
```
#### Response Example
```json
{
    "message": "About entry deleted"
}
```

- **Ta bort produkt från varukorg**: `DELETE /:userId/:itemId`

## Testning
Anrop kan göras via Postman,Insomnia eller annan valfri tjänst genom att skicka HTTP-requests till servern.
För att testa API:et kan du använda:
- **Postman**: Skapa en ny `Collection` och lägg till anrop till ovanstående endpoints.
- **Insomnia**: Skapa en ny `Workspace` och definiera endpoints där.
