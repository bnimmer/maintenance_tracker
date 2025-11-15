# Machinery Maintenance Tracker

A comprehensive web application for tracking machinery maintenance schedules, history, and alerts. Built with React, Express, tRPC, and MySQL, designed for small teams managing equipment maintenance.

## Features

### Core Functionality

- **Machine Management**: Add, edit, and delete machinery with unique IDs, names, locations, and descriptions
- **Maintenance Scheduling**: Set preventative maintenance intervals for each machine
- **Maintenance History**: Record maintenance activities with dates, types, technician notes, and file attachments
- **Alert System**: Automatic notifications for overdue maintenance
- **File Uploads**: Attach photos and documents to maintenance records using S3 storage
- **Dashboard**: Real-time overview of maintenance status, overdue items, and upcoming tasks
- **User Authentication**: Secure username/password authentication with equal permissions for team members

### Technical Features

- **Responsive Design**: Works seamlessly on desktop and Android devices
- **Dark Theme**: Modern, professional dark interface
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **CI/CD Ready**: GitHub Actions workflow for automated builds and deployments

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **date-fns** for date formatting
- **Sonner** for toast notifications

### Backend
- **Express 4** web framework
- **tRPC 11** for type-safe API
- **Drizzle ORM** for database management
- **MySQL 8** database
- **Multer** for file uploads
- **S3** for file storage

### Development
- **Vite** for fast development
- **pnpm** for package management
- **TSX** for TypeScript execution
- **Docker** for containerization

## Quick Start

### Prerequisites

- Node.js 22 or higher
- pnpm (or npm/yarn)
- MySQL 8.0 or higher
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd machinery-maintenance-tracker
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
DATABASE_URL=mysql://username:password@localhost:3306/maintenance_tracker
JWT_SECRET=your-secure-random-string
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
VITE_APP_TITLE=Machinery Maintenance Tracker
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im
```

4. **Set up the database**

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE maintenance_tracker;"

# Run migrations
pnpm db:push
```

5. **Start the development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Docker Deployment

### Using Docker Compose

1. **Configure environment variables**

Create a `.env` file with all required variables (see above).

2. **Build and start services**

```bash
docker-compose up -d
```

3. **Run database migrations**

```bash
docker-compose exec app pnpm db:push
```

4. **Access the application**

Open `http://localhost:3000` in your browser.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## User Guide

### Getting Started

1. **Sign In**: Click "Sign In to Get Started" on the landing page
2. **Add Your First Machine**: Navigate to "Machines" and click "Add Machine"
3. **Set Maintenance Schedule**: Enter machine details and set a maintenance interval in days
4. **Record Maintenance**: Click on a machine to view details and add maintenance records

### Managing Machines

**Adding a Machine**
1. Go to the Machines page
2. Click "Add Machine"
3. Fill in the required fields:
   - Machine ID (unique identifier)
   - Name (descriptive name)
   - Location (optional)
   - Description (optional)
   - Maintenance Interval (days between maintenance)
4. Click "Add Machine"

**Viewing Machine Details**
- Click the eye icon next to any machine in the list
- View machine information, maintenance schedule, and history

**Deleting a Machine**
- Click the trash icon next to a machine
- Confirm deletion (this will also delete all associated maintenance history)

### Recording Maintenance

1. Navigate to a machine's detail page
2. Click "Add Record" in the Maintenance History section
3. Fill in the maintenance details:
   - Date (when maintenance was performed)
   - Type (e.g., "Oil Change", "Inspection", "Repair")
   - Technician Name (optional)
   - Notes (optional details)
   - Attach Files (photos or documents)
4. Click "Add Record"

The system automatically updates the maintenance schedule based on the recorded date.

### File Attachments

**Uploading Files**
- When adding a maintenance record, click "Choose Files"
- Select one or multiple files (images, PDFs, documents)
- Files are automatically uploaded to secure cloud storage
- Maximum file size: 16MB per file

**Supported File Types**
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX

### Maintenance Schedules

**Setting a Schedule**
1. Go to a machine's detail page
2. Click "Set Schedule" or "Edit" in the Maintenance Schedule card
3. Enter the interval in days
4. Click "Save Schedule"

**How Schedules Work**
- The system calculates the next maintenance date based on the interval
- When you record maintenance, the schedule automatically updates
- Overdue maintenance triggers alerts

### Alerts

**Viewing Alerts**
- Click "View Alerts" from the dashboard or navigation menu
- Unread alerts appear at the top with red indicators
- Read alerts are shown below in a dimmed state

**Managing Alerts**
- Click "Mark as Read" to acknowledge an alert
- Alerts are automatically generated for overdue maintenance
- Check the dashboard for unread alert counts

### Dashboard

The dashboard provides an at-a-glance view of your maintenance status:

- **Total Machines**: Number of machines being tracked
- **Overdue Maintenance**: Machines requiring immediate attention
- **Upcoming (7 days)**: Scheduled maintenance in the next week
- **Unread Alerts**: Pending notifications

## Project Structure

```
machinery-maintenance-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client setup
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── _core/            # Core server functionality
│   ├── db.ts             # Database query functions
│   ├── routers.ts        # tRPC API routes
│   ├── fileUpload.ts     # File upload handler
│   └── storage.ts        # S3 storage integration
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database table definitions
├── shared/               # Shared types and constants
├── Dockerfile            # Docker container configuration
├── docker-compose.yml    # Docker Compose setup
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD pipeline
```

## API Documentation

The application uses tRPC for type-safe API communication. Key API endpoints:

### Machines
- `machines.create` - Create a new machine
- `machines.list` - List all user's machines
- `machines.get` - Get machine by ID
- `machines.update` - Update machine details
- `machines.delete` - Delete a machine

### Maintenance Schedule
- `schedule.get` - Get schedule for a machine
- `schedule.update` - Update maintenance schedule

### Maintenance History
- `history.create` - Add maintenance record
- `history.list` - List maintenance history for a machine
- `history.delete` - Delete maintenance record

### Alerts
- `alerts.list` - List all alerts
- `alerts.markRead` - Mark alert as read
- `alerts.checkOverdue` - Check for overdue maintenance

### Dashboard
- `dashboard.stats` - Get dashboard statistics

## Database Schema

### Tables

**users**
- User authentication and profile information

**machines**
- Machine details (ID, name, location, description)
- Linked to user who created it

**maintenance_schedules**
- Maintenance interval configuration
- Last and next maintenance dates

**maintenance_history**
- Historical maintenance records
- Linked to machines and users

**maintenance_files**
- File attachments for maintenance records
- S3 storage references

**alerts**
- System-generated notifications
- Read/unread status

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run database migrations
pnpm db:push

# Type checking
pnpm typecheck

# Lint code
pnpm lint
```

### Adding New Features

1. **Database Changes**: Update `drizzle/schema.ts` and run `pnpm db:push`
2. **Backend Logic**: Add query functions in `server/db.ts`
3. **API Endpoints**: Create tRPC procedures in `server/routers.ts`
4. **Frontend**: Build UI components in `client/src/pages/`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- All API endpoints require authentication
- File uploads are validated and size-limited
- Database queries use parameterized statements
- Passwords are never stored in plain text
- HTTPS should be used in production

## Troubleshooting

### Common Issues

**Database connection errors**
- Verify DATABASE_URL is correct
- Ensure MySQL is running
- Check user permissions

**File upload failures**
- Verify S3 credentials
- Check file size limits
- Ensure proper CORS configuration

**Authentication issues**
- Verify OAuth configuration
- Check JWT_SECRET is set
- Clear browser cookies and retry

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue in the project repository.

## Acknowledgments

Built with modern web technologies and best practices for reliability, security, and user experience.
