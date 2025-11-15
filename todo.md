# Machinery Maintenance Tracker - TODO

## Database Schema
- [x] Create machines table (id, name, machineId, location, description)
- [x] Create maintenance_schedules table (machineId, interval, lastMaintenance, nextMaintenance)
- [x] Create maintenance_history table (machineId, date, type, notes, technicianName, userId)
- [x] Create maintenance_files table (maintenanceHistoryId, fileKey, fileUrl, fileName, mimeType)
- [x] Create alerts table (machineId, alertType, message, isRead, createdAt)

## Backend API (tRPC Procedures)
- [x] Machine CRUD operations (create, list, get, update, delete)
- [x] Maintenance schedule management (create, update, get by machine)
- [x] Maintenance history operations (create, list by machine, update, delete)
- [x] File upload handler for maintenance documents/photos
- [x] Alert system (create alerts for overdue maintenance, list alerts, mark as read)
- [x] Dashboard statistics (total machines, upcoming maintenance, overdue count)

## Frontend UI
- [x] Dashboard layout with sidebar navigation
- [x] Home/Dashboard page with statistics cards
- [x] Machines list page with add/edit/delete functionality
- [x] Machine detail page showing schedule and history
- [x] Maintenance history form with file upload
- [x] Alerts notification panel
- [x] Responsive design for desktop and mobile/Android

## File Upload
- [x] S3 storage integration for photos and documents
- [x] File upload component with preview
- [x] Support for multiple file types (images, PDFs, documents)
- [x] File display in maintenance history

## Alerts & Notifications
- [x] Automatic alert generation for overdue maintenance
- [x] Alert badge in navigation
- [x] Alert list page with mark as read functionality
- [x] Background job to check and create alerts

## Docker & Deployment
- [x] Create Dockerfile for application
- [x] Create docker-compose.yml for local development
- [x] Add .dockerignore file
- [x] Create CI/CD pipeline configuration (GitHub Actions example)
- [x] Write deployment documentation

## Testing & Documentation
- [x] Test all CRUD operations
- [x] Test file upload functionality
- [x] Test alert generation
- [x] Create README with setup instructions
- [x] Document environment variables
- [x] Create user guide

## Elestio Deployment
- [x] Create elestio.yml configuration file
- [x] Create Elestio-specific docker-compose configuration
- [x] Write Elestio deployment documentation
- [x] Create post-deployment script
