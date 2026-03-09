# 🔴 PULSO — Botón global en tiempo real

Presionás el botón → alguien en cualquier parte del mundo lo ve al instante.

## Estructura del proyecto

```
pulso/
├── backend/        ← Node.js + Express + Socket.io
│   ├── src/
│   │   └── index.js
│   └── package.json
└── frontend/       ← React + TypeScript + Vite
    ├── src/
    │   ├── App.tsx
    │   ├── useSocket.ts
    │   └── main.tsx
    └── package.json
```

---

## 🖥️ Correrlo localmente

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Corre en http://localhost:3001
```

### 2. Frontend (en otra terminal)

```bash
cd frontend
npm install
cp .env.example .env.local   # copia el archivo de variables
npm run dev
# Abre http://localhost:5173
```

Listo. Abrí dos pestañas en el navegador y probalo.

---

## ☁️ Deploy en AWS (EC2 + S3)

### Backend en EC2

1. Crear instancia EC2 t2.micro (Amazon Linux 2)
2. En el Security Group, abrir puerto **3001** (TCP)
3. Conectarse por SSH:

```bash
ssh -i tu-clave.pem ec2-user@TU_IP_PUBLICA
```

4. Instalar Node.js:

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

5. Subir el código (con scp o git clone) y correrlo:

```bash
cd backend
npm install
# Instalar PM2 para que el servidor no se caiga
sudo npm install -g pm2
pm2 start src/index.js --name pulso-backend
pm2 save
pm2 startup
```

El backend queda corriendo en: `http://TU_IP_PUBLICA:3001`

---

### Frontend en S3 + CloudFront

1. En el archivo `frontend/.env.local`, poner la IP de tu EC2:

```
VITE_BACKEND_URL=http://TU_IP_PUBLICA:3001
```

2. Build del frontend:

```bash
cd frontend
npm run build
# Genera la carpeta dist/
```

3. Crear un bucket S3:
   - Ir a S3 → Create bucket
   - Nombre: `pulso-app` (o el que quieras)
   - Desactivar "Block all public access"
   - En Properties → Static website hosting → Enable
   - Index document: `index.html`

4. Subir la carpeta `dist/` al bucket

5. En Permissions → Bucket policy, pegar esto:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::pulso-app/*"
  }]
}
```

6. La URL de S3 ya funciona. Opcionalmente podés crear una distribución CloudFront para HTTPS y más velocidad.

---

## ☁️ Deploy alternativo más fácil (Railway + Vercel)

### Backend en Railway
1. Ir a railway.app → New Project → Deploy from GitHub
2. Seleccionar la carpeta `backend/`
3. Railway detecta Node.js automáticamente
4. Copiar la URL que te da Railway

### Frontend en Vercel
1. Ir a vercel.com → New Project → importar repo
2. Seleccionar la carpeta `frontend/`
3. En Environment Variables agregar:
   - `VITE_BACKEND_URL` = URL de Railway
4. Deploy

---

## 🔧 Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `PORT` | Backend | Puerto del servidor (default: 3001) |
| `FRONTEND_URL` | Backend | URL del frontend para CORS |
| `VITE_BACKEND_URL` | Frontend | URL del backend |
