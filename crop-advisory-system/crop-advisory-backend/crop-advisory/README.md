# 🌾 Crop Advisory System — Setup Guide

## Folder Structure
```
crop-advisory-system/
├── client/          ← React frontend
├── server/          ← Node.js + Express backend
└── ml-service/      ← Python Flask ML API
```

---

## Step 1 — Setup Server

```bash
cd server
npm install
```

Edit `.env` file — add your MongoDB URI and API keys.

```bash
npm run dev
# Server runs on http://localhost:5000
```

---

## Step 2 — Seed Crop Data (Run Once)

```bash
cd server
node utils/seedCrops.js
# Seeds 15 crops into MongoDB
```

---

## Step 3 — Setup React Client

```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom recharts
npm run dev
# React runs on http://localhost:5173
```

---

## Step 4 — Setup Python Flask

```bash
cd ml-service
pip install -r requirements.txt
python app.py
# Flask runs on http://localhost:8000
```

> Note: Flask runs in DEMO mode if plant_model.h5 is not found.
> Download model from Kaggle: search "plant disease classification model h5"
> Place the downloaded file as: ml-service/plant_model.h5

---

## Running All 3 Together

Open 3 terminals:

```
Terminal 1: cd server    && npm run dev
Terminal 2: cd client    && npm run dev  
Terminal 3: cd ml-service && python app.py
```

---

## Test in Postman

### Register
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Test Farmer",
  "email": "farmer@test.com",
  "password": "123456",
  "role": "farmer",
  "district": "Coimbatore",
  "state": "Tamil Nadu"
}

### Login
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "farmer@test.com",
  "password": "123456"
}
→ Copy the token from response

### Get Recommendations (add Authorization: Bearer <token>)
GET http://localhost:5000/api/crop/recommend

### Test Flask
GET http://localhost:8000/
POST http://localhost:8000/predict (form-data, key: image, value: any leaf image)
