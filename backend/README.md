# Scrapper API Backend

A Node.js backend application with authentication and web scraping capabilities, built with Bun, Express, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based authentication system
- 🕷️ Web scraping functionality  
- 🗄️ PostgreSQL database with Prisma ORM
- 🐳 Docker containerization
- 🔒 User-isolated data storage
- 📊 Comprehensive API endpoints

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Bun (for local development)

## Quick Start with Docker

### Production Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Start the application:
   ```bash
   docker-compose up --build
   ```

The application will be available at `http://localhost:3000`

### Development Setup

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/profile` | Get user profile | Yes |

### Scraping

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/scrapper/scrape` | Scrape a website | Yes |
| GET | `/api/v1/scrapper/data/:url` | Get scraped data | Yes |
| GET | `/api/v1/scrapper/websites` | Get all user's websites | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health-check` | Health check endpoint | No |

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Scrape Website (Authenticated)
```bash
curl -X POST http://localhost:3000/api/v1/scrapper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://example.com"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT tokens | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up postgres
   ```

4. Run database migrations:
   ```bash
   bunx prisma migrate dev
   ```

5. Generate Prisma client:
   ```bash
   bunx prisma generate
   ```

6. Start the development server:
   ```bash
   bun run dev
   ```

## Database Schema

The application uses the following main entities:

- **User**: Authentication and user management
- **ScrapedWebsite**: Stores scraped website information
- **Product**: Product catalog data
- **HeroProduct**: Featured products
- **PrivacyPolicy**: Privacy policy content
- **ReturnRefundPolicy**: Return/refund policy content
- **FAQ**: Frequently asked questions
- **SocialHandles**: Social media links
- **ContactDetails**: Contact information
- **BrandContext**: Brand information
- **ImportantLinks**: Important website links
- **BlogPost**: Blog posts

## Docker Commands

### Production
- Build and start: `docker-compose up --build`
- Start services: `docker-compose up`
- Stop services: `docker-compose down`
- View logs: `docker-compose logs -f`

### Development
- Build and start: `docker-compose -f docker-compose.dev.yml up --build`
- Start services: `docker-compose -f docker-compose.dev.yml up`
- Stop services: `docker-compose -f docker-compose.dev.yml down`

### Database Operations
- Run migrations: `docker-compose exec backend bunx prisma migrate deploy`
- Access database: `docker-compose exec postgres psql -U scrapper_user -d scrapper_db`

## Security Features

- 🔐 Password hashing with bcrypt
- 🎫 JWT token authentication
- 🔒 User data isolation
- ✅ Input validation
- 🛡️ Secure error handling

## Done by 
Aakash Subedi

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │───▶│   (Express)     │───▶│   (PostgreSQL)  │
│                 │    │   + Auth        │    │   + Prisma      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.


