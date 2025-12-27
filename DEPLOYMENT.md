# Deployment Guide for kTracker

This guide covers various deployment options for kTracker in production.

## Prerequisites

- Domain name (optional, for custom URL)
- Cloud provider account (AWS, Vercel, Railway, etc.)
- Basic knowledge of Docker (if using containerized deployment)

## Environment Variables

Before deploying, configure your production environment variables:

```bash
# Backend
DATABASE_URL="postgresql://user:password@host:5432/ktracker?schema=public"
PORT=3000
NODE_ENV="production"
JWT_SECRET="your-production-secret-min-32-chars"
JWT_EXPIRES_IN="7d"

# Frontend
VITE_API_URL="https://your-api-domain.com/api"
VITE_APP_TITLE="kTracker"
```

**Security Note:** 
- Generate JWT_SECRET with: `openssl rand -base64 32`
- Never commit production secrets to git
- Use a secrets manager (AWS Secrets Manager, Railway Env Vars, etc.)

## Option 1: Vercel (Frontend) + Railway (Backend)

### Frontend Deployment to Vercel

1. **Prepare for deployment:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to [Vercel](https://vercel.com)
   - Set root directory to `frontend`
   - Configure build command: `npm run build`
   - Configure output directory: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your backend API URL (Railway deploy URL)

3. **Deploy:**
   - Push your changes to GitHub
   - Vercel will auto-deploy on push
   - Your app will be live at `https://your-project.vercel.app`

### Backend Deployment to Railway

1. **Prepare for deployment:**
   - Ensure Railway is set up for PostgreSQL
   - Configure database connection string

2. **Deploy to Railway:**
   - Connect your GitHub repository to [Railway](https://railway.app)
   - Set root directory to `.` (project root)
   - Configure build command: `bun install && bun run build`
   - Configure start command: `bun run index.ts`
   - Add a PostgreSQL service from Railway
   - Copy the DATABASE_URL from Railway to environment variables
   - Add other environment variables:
     - `JWT_SECRET`: Your production secret
     - `JWT_EXPIRES_IN`: `7d`
     - `NODE_ENV`: `production`

3. **Run database migrations:**
   - In Railway console, run:
     ```bash
     npx prisma migrate deploy
     ```

4. **Get your API URL:**
   - Railway will provide a URL like `https://your-backend.up.railway.app`
   - Use this as `VITE_API_URL` in Vercel

## Option 2: Docker Deployment

### 1. Build Docker Images

**Backend:**
```bash
docker build -t ktracker-backend .
```

**Frontend:**
```bash
cd frontend
docker build -t ktracker-frontend .
```

### 2. Docker Compose (Full Stack)

Use the provided `docker-compose.yml`:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- `postgres` - PostgreSQL database
- `backend` - Bun/Hono API server
- `frontend` - React app

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    restart: always
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    restart: always
    environment:
      VITE_API_URL: ${API_URL}
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Option 3: AWS Deployment

### Using AWS App Runner (Backend) + CloudFront (Frontend)

1. **Frontend (CloudFront + S3):**
   - Build frontend: `cd frontend && npm run build`
   - Upload `dist/` to S3 bucket
   - Configure CloudFront to serve from S3
   - Set up custom domain and SSL certificate

2. **Backend (AWS App Runner or ECS):**
   - Create ECR repository for Docker image
   - Build and push Docker image to ECR
   - Deploy to App Runner or ECS
   - Configure RDS PostgreSQL instance
   - Set environment variables and secrets

### Using AWS Elastic Beanstalk

1. **Prepare deployment package:**
   ```bash
   # Backend
   zip -r ktracker-backend.zip . -x "frontend/*" "node_modules/*" ".git/*"

   # Frontend
   cd frontend
   npm run build
   zip -r ../ktracker-frontend.zip dist/
   ```

2. **Deploy to Elastic Beanstalk:**
   - Create two environments (backend and frontend)
   - Upload ZIP files
   - Configure environment variables
   - Set up load balancer and SSL

## Database Migrations in Production

When deploying schema changes:

1. **Create migration locally:**
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Apply in production:**
   ```bash
   # For Railway/AWS/etc.
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Monitoring and Logging

### Health Checks

Backend includes health check endpoint:
```bash
curl https://your-api-domain.com/health
```

Should return:
```json
{ "status": "ok", "timestamp": "..." }
```

### Logs

- **Vercel:** View logs in Vercel dashboard
- **Railway:** View logs in Railway console
- **Docker:** Use `docker-compose logs -f`
- **AWS:** CloudWatch Logs

## Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set CORS origins to production domain only
- [ ] Use environment-specific DATABASE_URL
- [ ] Enable rate limiting (if needed)
- [ ] Set up firewall rules
- [ ] Regular security updates for dependencies
- [ ] Use secrets manager for sensitive data
- [ ] Enable logging and monitoring
- [ ] Set up backup strategy for database

## Performance Optimization

1. **Frontend:**
   - Enable CDN (Vercel/CloudFront)
   - Use code splitting (Vite does this automatically)
   - Enable Gzip compression
   - Optimize images and assets

2. **Backend:**
   - Use PostgreSQL connection pooling
   - Enable caching for frequent queries
   - Use CDN for static assets
   - Monitor and optimize slow queries

## Backup Strategy

**PostgreSQL:**
- Enable automated backups (Railway provides this)
- For AWS: Enable RDS automated backups
- For manual backup:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

**Restore from backup:**
```bash
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### Common Issues

**CORS errors:**
- Verify CORS origins match frontend domain
- Check backend environment variables

**Database connection errors:**
- Verify DATABASE_URL is correct
- Check database service is running
- Check firewall rules

**Build failures:**
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Review build logs for specific errors

**Environment variable issues:**
- Verify all required env vars are set
- Check for typos in variable names
- Ensure secrets are properly escaped

## Rollback Procedure

If deployment fails or issues arise:

1. **Vercel:** Go to deployments → click rollback on previous deployment
2. **Railway:** Redeploy previous commit
3. **Docker:** `docker-compose down && docker-compose up -d --build`
4. **AWS:** Restore from previous snapshot or redeploy previous commit

## Cost Estimates

- **Vercel:** Free tier available, paid tiers from $20/month
- **Railway:** Free tier ($5/month) to paid ($20+/month)
- **AWS App Runner:** $40/month + RDS costs
- **Self-hosted (Docker):** Cost of server only ($5-20/month)

## Support

For deployment issues:
- Review deployment provider documentation
- Check logs for specific error messages
- Open a GitHub issue with detailed error information
