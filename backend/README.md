# Web Scraper API Backend

A comprehensive web scraping API built with TypeScript, Express.js, and Prisma. This backend service provides intelligent web scraping capabilities for e-commerce and business websites, extracting structured data including products, contact information, social handles, FAQs, and more.

## 🚀 Features

### Web Scraping Capabilities
- **Product Catalog Extraction**: Automatically detects and extracts product names from e-commerce websites
- **Hero Products**: Identifies featured/highlighted products on homepages
- **Contact Information**: Extracts emails, phone numbers, and contact page content
- **Social Media Handles**: Finds Instagram, Facebook, TikTok, Twitter, and YouTube links
- **Policy Documents**: Locates and extracts privacy policies and return/refund policies
- **FAQs**: Extracts frequently asked questions and answers
- **Brand Context**: Gathers brand information and descriptions
- **Important Links**: Finds order tracking, shipping, size guide, and blog links
- **Blog Posts**: Extracts blog post titles, URLs, and excerpts

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication system
- **Password Hashing**: Bcrypt encryption for password security
- **Protected Routes**: All scraping endpoints require authentication
- **User Management**: Registration, login, and profile management

### Data Management
- **PostgreSQL Database**: Robust relational database with Prisma ORM
- **User-specific Data**: Each user's scraped data is isolated and secure
- **Comprehensive Schema**: Structured data storage for all scraped information
- **Data Persistence**: Scraped data is saved and can be retrieved later

## 🛠 Technology Stack

- **Runtime**: Bun (Fast JavaScript runtime)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Bcrypt
- **Web Scraping**: Axios + Cheerio + Scrapfly SDK
- **Logging**: Morgan middleware
- **Environment**: Docker support

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.2.8 or higher
- PostgreSQL database (local or cloud)
- Node.js 18+ (if not using Bun)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd backend
bun install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000

# Optional: Scrapfly API (for enhanced scraping)
SCRAPFLY_API_KEY="your-scrapfly-api-key"
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d

# Set up the database URL for local Docker
DATABASE_URL="postgresql://poll_user:poll_password@localhost:5432/poll_db"
```

#### Option B: Using Neon Database (Cloud)

1. Create a free account at [Neon](https://neon.tech)
2. Create a new database
3. Copy the connection string and set it as `DATABASE_URL` in your `.env` file

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

### 4. Database Migration

```bash
# Generate Prisma client
bun run prisma generate

# Run database migrations
bun run prisma migrate dev
```

### 5. Start the Server

```bash
# Development mode
bun run index.ts

# Or with auto-reload (if you have nodemon)
bun run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 🐳 Docker Deployment

### Using Docker Compose (Full Stack)

```bash
# Start all services (PostgreSQL + API)
docker-compose up -d

# Run migrations
bun run prisma migrate deploy

# The API will be available at http://localhost:3000
```

### Using Docker (API Only)

```bash
# Build the image
docker build -t web-scraper-api .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-secret" \
  web-scraper-api
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <jwt-token>
```

### Scraping Endpoints

#### Scrape Website
```http
POST /api/v1/scrapper/scrape
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "url": "https://example-ecommerce.com"
}
```

#### Get Scraped Data
```http
GET /api/v1/scrapper/data/<encoded-url>
Authorization: Bearer <jwt-token>
```

#### List All Scraped Websites
```http
GET /api/v1/scrapper/websites
Authorization: Bearer <jwt-token>
```

### Health Check
```http
GET /health-check
```

## 🔍 How Web Scraping Works

### 1. Intelligent URL Processing
- Automatically adds HTTPS protocol if missing
- Validates URL format before processing
- Handles various URL formats and redirects

### 2. Multi-Strategy Data Extraction

#### Product Detection
- Searches for common product CSS selectors (`.product-item`, `.product-card`, etc.)
- Follows product listing page links (`/products`, `/shop`, `/catalog`)
- Extracts product names from multiple sources
- Identifies hero/featured products separately

#### Contact Information Extraction
- Scans for email patterns using regex
- Extracts phone numbers in various formats
- Visits contact pages for additional information
- Processes contact forms and details

#### Social Media Detection
- Searches for social media platform URLs
- Handles various URL formats (mobile, web, shortened links)
- Supports Instagram, Facebook, TikTok, Twitter, YouTube

#### Content Analysis
- Extracts brand context from meta descriptions, about pages
- Processes FAQ sections with question-answer pairs
- Finds policy documents (privacy, returns, shipping)
- Discovers important navigation links

### 3. Data Processing & Storage
- Cleans and normalizes extracted data
- Removes duplicates and irrelevant information
- Stores data in relational database with proper relationships
- Associates all data with the authenticated user

### 4. Error Handling & Resilience
- Implements retry mechanisms for failed requests
- Handles various website structures gracefully
- Provides detailed error messages for troubleshooting
- Supports timeout configurations for slow websites

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Authentication and user management
- **ScrapedWebsites**: Main website records
- **Products**: Regular product catalog
- **HeroProducts**: Featured/highlighted products
- **PrivacyPolicy**: Privacy policy documents
- **ReturnRefundPolicy**: Return and refund policies
- **FAQs**: Frequently asked questions
- **SocialHandles**: Social media links
- **ContactDetails**: Contact information
- **BrandContext**: Brand descriptions and context
- **ImportantLinks**: Navigation and important links
- **BlogPosts**: Blog content and metadata

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `SCRAPFLY_API_KEY` | Scrapfly API key for enhanced scraping | - | ❌ |

### Scraping Configuration
- **Request timeout**: 15 seconds
- **User-Agent**: Modern browser simulation
- **Retry logic**: Built-in for failed requests
- **Rate limiting**: Configurable delays between requests

## 🚀 Deployment

### Production Environment Setup

1. **Database**: Use a managed PostgreSQL service (Neon, Supabase, AWS RDS)
2. **Environment**: Set production environment variables
3. **Security**: Use strong JWT secrets and HTTPS
4. **Monitoring**: Implement logging and error tracking
5. **Scaling**: Use load balancers and multiple instances

### Recommended Cloud Platforms
- **Vercel**: Easy deployment with serverless functions
- **Railway**: Full-stack deployment with PostgreSQL
- **Heroku**: Traditional PaaS deployment
- **DigitalOcean**: VPS with Docker containers
- **AWS/GCP**: Enterprise-scale deployment

## 🧪 Testing

```bash
# Run tests (if available)
bun test

# Check TypeScript compilation
bun run tsc --noEmit

# Lint code
bun run lint
```

## 📝 Development

### Adding New Scraping Features

1. Update the `ScrapedData` interface in `scrapper.service.ts`
2. Add extraction method for new data type
3. Update database schema in `schema.prisma`
4. Run migrations: `bunx prisma migrate dev`
5. Update the `ScrapperDatabase.saveScrapedData` method

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔒 Security Considerations

- All passwords are hashed using bcrypt with salt rounds
- JWT tokens have configurable expiration times
- User data is isolated by user ID
- Input validation on all endpoints
- SQL injection protection through Prisma ORM
- Rate limiting recommended for production

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created by Aakash Subedi - A comprehensive web scraping solution for modern businesses.

---

**Note**: This is a backend API service. For production use, ensure proper security measures, rate limiting, and error monitoring are in place.
