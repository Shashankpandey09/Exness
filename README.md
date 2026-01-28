# Trading Platform

A high-performance, real-time cryptocurrency trading platform with leveraged trading support. Built with a microservices architecture using Node.js, TypeScript, Redis Streams, and PostgreSQL.

## 🚀 Features

- **Real-time Price Feeds**: Live cryptocurrency prices from Backpack Exchange
- **Leveraged Trading**: Support for leveraged positions on crypto pairs
- **Magic Link Authentication**: Passwordless authentication via email
- **Automatic Liquidation**: Position management with automatic liquidation at 90% loss
- **Trade Snapshotting**: Persistent trade history with PostgreSQL
- **Request-Response Pattern**: Reliable trade execution with timeout handling

## 📐 Architecture


<img width="1806" height="902" alt="image" src="https://github.com/user-attachments/assets/b12cebac-7651-49b8-a4e1-62ce5a185634" />





### Components

| Component | Description | Port |
|-----------|-------------|------|
| **Primary Backend** | Express.js API server handling authentication and trade requests | 3000 |
| **Engine** | Core trade processing engine consuming Redis streams | - |
| **Backpack Poller** | WebSocket client for real-time price feeds from Backpack Exchange | - |
| **Redis** | Message broker using Redis Streams and Pub/Sub | 6379 |
| **PostgreSQL** | Persistent storage for users, trades, and assets | 5432 |

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Message Broker**: Redis (Streams + Pub/Sub)
- **Authentication**: JWT + Magic Links
- **Email**: Resend API

## 📦 Installation

### Prerequisites

- Node.js 18+
- Redis 7+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd super_30_contest
   ```

2. **Install dependencies for all services**
   ```bash
   # Primary Backend
   cd Primary_backend
   npm install
   npx prisma generate
   
   # Engine
   cd ../Engine
   npm install
   npx prisma generate
   
   # Backpack Poller
   cd ../backpack_poller
   npm install
   ```

3. **Set up environment variables**

   **Primary Backend** (`Primary_backend/.env`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/trading_db
   SECRET_KEY=your-jwt-secret-key
   RESEND_API_KEY=re_xxxxxxxx
   BASE_URL=http://localhost:3000
   REDIS_URL=redis://localhost:6379
   PORT=3000
   ```

   **Engine** (`Engine/.env`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/trading_db
   REDIS_URL=redis://localhost:6379
   ```

4. **Set up the database**
   ```bash
   cd Primary_backend
   npx prisma migrate dev
   ```

5. **Start services**
   ```bash
   # Terminal 1: Start Redis
   redis-server

   # Terminal 2: Start Primary Backend
   cd Primary_backend
   npm run dev

   # Terminal 3: Start Engine
   cd Engine
   npm run dev

   # Terminal 4: Start Backpack Poller
   cd backpack_poller
   npm run dev
   ```

## 🐳 Docker

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f primary_backend
```

### Available Services

| Service | Port | Description |
|---------|------|-------------|
| `primary_backend` | 3000 | API Server |
| `engine` | - | Trade Processor |
| `backpack_poller` | - | Price Feed Service |
| `redis` | 6379 | Message Broker |
| `postgres` | 5432 | Database |

## 📚 API Reference

### Authentication

#### Sign Up
```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Sign In
```http
POST /api/v1/user/signin
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Magic Link
```http
GET /api/v1/user/verify?token=<jwt-token>
```

### Trading

#### Open Trade
```http
POST /api/v1/trade/open
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "type": "buy",           // "buy" or "sell"
  "symbol": "BTC_USDC",    // Trading pair
  "quantity": 1,           // Amount
  "leverage": 10           // Leverage multiplier
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Trade opened successfully",
  "tradeId": "uuid",
  "data": {
    "openPrice": 97000,
    "margin": 9700,
    "balance": 40300
  }
}
```

**Response (Timeout)**:
```json
{
  "success": false,
  "message": "Trade request timed out. Please try again or check your trade history.",
  "tradeId": "uuid"
}
```

#### Close Trade
```http
POST /api/v1/trade/close
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "tradeId": "uuid",
  "symbol": "BTC_USDC",
  "type": "buy"
}
```

### Health Check
```http
GET /health
```

## 💹 Supported Trading Pairs

| Symbol | Description | Decimals |
|--------|-------------|----------|
| `BTC_USDC` | Bitcoin / USDC | 1 |
| `ETH_USDC` | Ethereum / USDC | 2 |
| `SOL_USDC_PERP` | Solana Perpetual | 2 |

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `SECRET_KEY` | JWT signing secret | - |
| `RESEND_API_KEY` | Resend email API key | - |
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `PORT` | HTTP server port | `3000` |

## 🔒 Security Features

- **Passwordless Authentication**: Magic link emails for secure login
- **JWT Sessions**: Short-lived tokens with 7-day expiry
- **Input Validation**: Request validation on all endpoints
- **Balance Protection**: Margin checks before trade execution
- **Automatic Liquidation**: Positions closed at 90% loss

## 📊 Database Schema

```
User
├── id (PK)
├── username (email, unique)
├── lastLoggedIn
└── usd_balance

Asset
├── id (PK, UUID)
├── symbol (unique)
├── name
├── decimals
└── createdAt

ExistingTrade
├── id (PK, UUID)
├── symbol
├── openPrice
├── closePrice
├── leverage
├── pnl
├── streamId
├── userId (FK → User)
├── assetId (FK → Asset)
├── liquidated
└── createdAt
```

## 🔧 Development

### Building

```bash
# Build all services
npm run build --prefix Primary_backend
npm run build --prefix Engine
npm run build --prefix backpack_poller
```

### Running Tests

```bash
# Run tests (when implemented)
npm test
```

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 📝 Future Enhancements

- [ ] Stop-loss and take-profit orders
- [ ] WebSocket API for real-time updates
- [ ] Trade history API endpoint
- [ ] Portfolio management
- [ ] Advanced order types (limit, stop)
- [ ] Rate limiting
- [ ] Comprehensive test suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ for the Super 30 Contest
