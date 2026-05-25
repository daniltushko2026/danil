# 🚀 Castle MMO Server Setup - Полное руководство

## 📋 Что это?

**Node.js сервер, который хранит данные игроков в players.json файле на сервере!**

```
Игрок 1     Игрок 2     Игрок 3
    ↓           ↓           ↓
    └─────────┬──────────┘
              ↓
        Node.js Server
              ↓
        players.json (на сервере!)
```

**Все данные сохраняются НАВСЕГДА на сервере!**

---

## 🎯 Структура файлов

```
📦 Castle MMO Server
├─ 📄 index-server.html (игра)
├─ 📄 admin-server.html (админ панель)
├─ 📄 server-mmo.js (сервер Node.js)
├─ 📄 players.json (БД игроков на сервере)
├─ 📄 package-server.json (зависимости)
└─ 📄 SERVER_SETUP.md (этот файл)
```

---

## ⚙️ Установка

### 1. Локально (разработка)

```bash
# 1. Скачай файлы
git clone ...
cd castle-mmo-server

# 2. Переименуй файл
mv package-server.json package.json

# 3. Установи зависимости
npm install

# 4. Запусти сервер
npm start

# 5. Открой браузер
http://localhost:3000
```

**Важно:** Используй `npm start`, а не просто открытие HTML файла!

### 2. На хостинге (Heroku, Vercel, Render)

#### Heroku:

```bash
# 1. Установи Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Логинись
heroku login

# 3. Создай приложение
heroku create castle-mmo-pvp

# 4. Загрузи код
git push heroku main

# 5. Готово!
# https://castle-mmo-pvp.herokuapp.com/
```

#### Vercel (лучше для статики, но можно):

```bash
# Используй build version
# или используй другой хостинг с Node.js
```

#### Render (рекомендуется):

```bash
# 1. Зарегистрируйся на render.com
# 2. New → Web Service
# 3. Подключи GitHub репо
# 4. Выбери:
#    - Runtime: Node
#    - Build: npm install
#    - Start: npm start
# 5. Deploy!
```

---

## 🔧 API Endpoints

### Все игроки
```bash
GET /api/players
# Ответ:
{
  "players": {
    "Admin": {...},
    "Player2": {...}
  },
  "battles": [...]
}
```

### Конкретный игрок
```bash
GET /api/players/Danil
# Ответ:
{
  "username": "Danil",
  "gold": 800,
  ...
}
```

### Создать/обновить игрока
```bash
POST /api/players/Danil
Content-Type: application/json

{
  "gold": 1000,
  "iron": 150,
  "soldiers": 10000,
  ...
}
```

### Добавить золото
```bash
POST /api/players/Danil/gold
Content-Type: application/json

{ "amount": 500 }
```

### Добавить железо
```bash
POST /api/players/Danil/iron
Content-Type: application/json

{ "amount": 100 }
```

### Добавить солдат
```bash
POST /api/players/Danil/soldiers
Content-Type: application/json

{ "amount": 1000 }
```

### Записать бой
```bash
POST /api/battles
Content-Type: application/json

{
  "attacker": "Danil",
  "defender": "Player2",
  "attackerPower": 42,
  "defenderPower": 11,
  "result": "win",
  "losses": 375
}
```

### Все боевые отчёты
```bash
GET /api/battles
# Ответ: массив всех боев
```

### Удалить игрока
```bash
DELETE /api/players/Danil
```

---

## 💾 players.json структура

```json
{
  "gameVersion": "3.0.0-Warfare",
  "lastUpdated": "2026-05-25T16:45:00.000Z",
  "players": {
    "Admin": {
      "username": "Admin",
      "password": "admin123",
      "gold": 5000,
      "iron": 500,
      "soldiers": 50000,
      "stats": {
        "attack": 60,
        "defense": 45,
        "shield": 40
      },
      "battles": {
        "wins": 100,
        "losses": 5,
        "draws": 10
      },
      "battleReports": []
    },
    "Danil": { ... }
  },
  "battles": [
    {
      "attacker": "Danil",
      "defender": "Player2",
      "attackerPower": 42,
      "defenderPower": 11,
      "result": "win",
      "losses": 375,
      "timestamp": "2026-05-25T16:30:00.000Z"
    }
  ]
}
```

---

## 🎮 Как работает

### Игрок заходит:

```
1. Открывает http://localhost:3000/
2. Вводит пароль и имя
3. HTML запрашивает /api/players
4. Сервер читает players.json
5. Отправляет все игроки в браузер
6. Игрок видит список противников
```

### Игрок выигрывает бой:

```
1. Кликает на противника
2. HTML вычисляет победителя
3. HTML отправляет:
   - POST /api/battles (запись боя)
   - POST /api/players/Danil (обновить победителя)
   - POST /api/players/Player2 (обновить проигравшего)
4. Сервер обновляет players.json
5. Все игроки видят новые данные через 1 сек!
```

### Админ добавляет золото:

```
1. Админ открывает admin-server.html
2. Вводит имя и количество
3. Кликает "Добавить"
4. HTML отправляет POST /api/players/Danil/gold
5. Сервер обновляет players.json
6. Danil видит новое золото через 1 сек!
```

---

## 🔐 Безопасность

### Текущая версия (DEV):
- Пароли в открытом виде (OK для внутреннего тестирования)
- Админ может всё (нормально)
- Данные на сервере (защищены!)

### Для реального использования:

1. **Хеширование паролей:**
```bash
npm install bcryptjs
```

2. **Добавить в server-mmo.js:**
```javascript
const bcrypt = require('bcryptjs');

// При регистрации:
const hashedPassword = await bcrypt.hash(password, 10);

// При логине:
const valid = await bcrypt.compare(password, hashedPassword);
```

3. **JWT токены для сессий:**
```bash
npm install jsonwebtoken
```

4. **Переменные окружения:**
```bash
npm install dotenv
```

Создай `.env`:
```
PORT=3000
NODE_ENV=production
JWT_SECRET=твой_супер_секретный_ключ
```

---

## 🚨 Частые ошибки

### Ошибка: "Cannot find module 'express'"

**Решение:**
```bash
npm install
```

### Ошибка: "Port 3000 already in use"

**Решение:**
```bash
# Измени порт в server-mmo.js:
const PORT = process.env.PORT || 3001;
```

### Ошибка: "CORS error"

**Решение:**
Это нормально при локальной разработке. CORS уже включен в server-mmo.js:
```javascript
app.use(cors());
```

### players.json не обновляется

**Решение:**
1. Проверь права доступа к файлу
2. Убедись что сервер пишет в правильную папку
3. Проверь консоль сервера на ошибки

---

## 📊 Мониторинг

### Логи сервера:

```bash
npm start
# Вывод:
# 🚀 Castle MMO Server запущен!
# 📍 http://localhost:3000
# ✅ API endpoints:
#   GET  /api/players - все игроки
#   ...
```

### Проверить players.json:

```bash
# На сервере можно смотреть размер файла
ls -lh players.json

# Или просто открыть:
cat players.json | head
```

### Health check:

```bash
curl http://localhost:3000/api/health
# Ответ: {"status":"ok","timestamp":"2026-05-25T..."}
```

---

## 🔄 Резервные копии

### Автоматические:

Сервер сохраняет players.json **каждый раз** когда происходит изменение!

### Ручные резервные копии:

```bash
# Linux/Mac:
cp players.json players.json.backup

# Windows:
copy players.json players.json.backup
```

### Восстановление:

```bash
cp players.json.backup players.json
# Перезагрузи сервер
npm restart
```

---

## 🌐 Развёртывание шаги

### 1. Локально тестировать:
```bash
npm install
npm start
# http://localhost:3000
```

### 2. Создай GitHub репо:
```bash
git init
git add .
git commit -m "Castle MMO Server v3.0"
git push origin main
```

### 3. Развернуть на Render:

```
1. Зайди render.com
2. New → Web Service
3. Подключи GitHub
4. Select repository: castle-mmo-server
5. Settings:
   - Name: castle-mmo
   - Root: .
   - Build: npm install
   - Start: npm start
6. Deploy!
7. Ждёшь 2-3 минуты
8. Готово! Откроется https://castle-mmo.onrender.com/
```

### 4. Убедись что работает:

```bash
# Проверь:
curl https://castle-mmo.onrender.com/api/health

# Открой в браузере:
https://castle-mmo.onrender.com/
```

---

## 📱 Несколько игроков одновременно

Теперь **ВСЕ игроки видят одинаковые данные**:

```
Игрок 1           Игрок 2           Игрок 3
  |                 |                 |
  └────────┬────────┼────────┬────────┘
           |        |        |
        Все читают из players.json
           |        |        |
     Один бой обновляет
     и ВСЕ видят! ✅
```

Магия синхронизации каждую сек:
```javascript
setInterval(syncAllData, 1000);
// Все игроки каждую сек загружают свежие данные!
```

---

## 🎯 Готово!

Теперь у тебя есть:

✅ Реальный Node.js сервер
✅ Постоянное хранилище (players.json)
✅ API для игры
✅ Синхронизация между всеми игроками
✅ Админ панель
✅ Готово к развёртыванию!

**Запусти и играй!** 🚀

```bash
npm install
npm start
# http://localhost:3000
```
