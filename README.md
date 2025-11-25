# Angular Blog CMS

A modern, full-featured Content Management System (CMS) for blog management built with Angular 20. This application provides a comprehensive interface for managing blog posts, categories, tags, users, and media files with role-based access control.

## 🚀 Features

### Core Functionality
- **Post Management**: Create, edit, delete, and publish blog posts with rich text editing (TinyMCE)
- **Category Management**: Hierarchical category system with parent-child relationships
- **Tag Management**: Organize posts with tags and track usage statistics
- **User Management**: Complete user administration with role-based permissions
- **File Management**: Upload, view, and manage media files
- **Profile Management**: User profile editing and password change functionality

### Technical Features
- **Role-Based Access Control (RBAC)**: Admin, Writer, and Guest roles with route guards
- **Authentication & Authorization**: JWT-based authentication with HTTP interceptors
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Reactive Programming**: Angular Signals and RxJS for state management
- **Type Safety**: Strict TypeScript with comprehensive interfaces
- **Standalone Components**: Modern Angular architecture with standalone components
- **Lazy Loading**: Route-based code splitting for optimal performance

## 🛠️ Tech Stack

### Frontend Framework
- **Angular**: 20.3.0
- **TypeScript**: 5.9.2
- **RxJS**: 7.8.0

### UI & Styling
- **Tailwind CSS**: 3.4.14
- **SCSS**: For component styling
- **Angular CDK**: 20.2.14

### Rich Text Editor
- **TinyMCE**: 8.2.2
- **@tinymce/tinymce-angular**: 9.1.1

### Development Tools
- **Angular CLI**: 20.3.10
- **Karma & Jasmine**: For unit testing
- **Prettier**: Code formatting

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── custom-select/    # Custom dropdown component
│   │   ├── file-picker/      # File upload component
│   │   ├── header/           # Application header
│   │   ├── loading/          # Loading indicator
│   │   ├── modal/            # Modal dialogs (error, success, warning)
│   │   ├── modal-container/  # Modal container wrapper
│   │   ├── sidebar/          # Navigation sidebar
│   │   └── tags-input/       # Tags input component
│   ├── enums/                # TypeScript enums
│   ├── guards/               # Route guards (auth, admin, writer, public)
│   ├── interceptors/         # HTTP interceptors (request, response)
│   ├── interfaces/           # TypeScript interfaces
│   ├── layouts/              # Layout components
│   │   ├── private-layout/   # Authenticated user layout
│   │   └── public-layout/    # Public (login) layout
│   ├── pages/                # Feature pages
│   │   ├── categories/       # Category management
│   │   ├── files/            # File management
│   │   ├── home/             # Dashboard
│   │   ├── login/            # Authentication
│   │   ├── posts/            # Post management
│   │   ├── profile/          # User profile
│   │   ├── tags/             # Tag management
│   │   └── users/            # User management
│   └── services/             # Application services
│       ├── api-service.ts    # API communication
│       ├── loading-service.ts
│       ├── modal-service.ts
│       └── storage-service.ts
├── assets/                   # Static assets
│   ├── images/               # Images and SVG icons
│   └── openapi.json          # API specification
└── environments/             # Environment configurations
```

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **Angular CLI**: v20.3.10 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd angular-blog-cms
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Update `src/environments/environment.ts` with your production API URL
   - Update `src/environments/environment.development.ts` with your development API URL

4. Start the development server:
```bash
npm start
# or
ng serve
```

5. Open your browser and navigate to `http://localhost:4200/`

## 🔧 Development

### Available Scripts

- `npm start` or `ng serve`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run watch`: Build and watch for changes
- `npm test` or `ng test`: Run unit tests

### Development Server

The development server runs on `http://localhost:4200/` by default. The application will automatically reload when you modify source files.

### Code Scaffolding

Generate new components, services, and more using Angular CLI:

```bash
# Generate a component
ng generate component component-name

# Generate a service
ng generate service service-name

# Generate a guard
ng generate guard guard-name
```

For a complete list of available schematics:
```bash
ng generate --help
```

## 🏗️ Building

### Production Build

To build the project for production:

```bash
npm run build
# or
ng build
```

This compiles your project and stores the build artifacts in the `dist/` directory. The production build optimizes the application for performance and speed.

### Build Configurations

- **Development**: `ng build --configuration development`
- **Production**: `ng build --configuration production` (default)

## 🧪 Testing

### Unit Tests

Run unit tests using Karma test runner:

```bash
npm test
# or
ng test
```

Tests execute in watch mode by default. The test runner will watch for file changes and re-run tests automatically.

### End-to-End Tests

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs (e.g., Cypress, Playwright).

## ⚙️ Configuration

### Environment Variables

Configure API endpoints in environment files:

**Development** (`src/environments/environment.development.ts`):
```typescript
export const environment = {
    apiUrl: 'http://localhost:8000/api/v1',
    title: 'Angular Blog CMS - Development',
};
```

**Production** (`src/environments/environment.ts`):
```typescript
export const environment = {
    apiUrl: 'http://localhost:8000/api/v1',
    title: 'Angular Blog CMS - Production',
    production: true
};
```

### API Configuration

The application expects a RESTful API with the following base structure:
- Base URL: Configured in environment files
- Authentication: JWT Bearer tokens
- Endpoints: See `src/assets/openapi.json` for API specification

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to all features including user management
- **Writer**: Can create and manage posts, categories, tags, and files
- **Guest**: Limited read-only access

### Route Guards

- **authGuard**: Protects authenticated routes
- **adminGuard**: Restricts access to admin-only routes
- **writerGuard**: Restricts access to writer-only routes
- **publicGuard**: Redirects authenticated users away from public routes (e.g., login)

### Authentication Flow

1. User logs in via `/login`
2. JWT token is stored in browser storage
3. Token is automatically attached to HTTP requests via request interceptor
4. Response interceptor handles authentication errors and token refresh

## 📦 Key Modules

### Post Management
- Create posts with rich text content
- SEO metadata (meta tags, Open Graph, Twitter Cards)
- Post status management (draft, published)
- Category and tag assignment
- Thumbnail and banner image support

### Category Management
- Hierarchical category structure
- Parent-child relationships
- Slug generation
- Category path tracking

### Tag Management
- Tag creation and editing
- Usage count tracking
- Slug generation

### User Management (Admin Only)
- User CRUD operations
- Role assignment
- User lock/unlock functionality
- Password management

### File Management (Writer & Admin)
- Image upload
- File listing with pagination
- File deletion

## 🎨 Styling Guidelines

- **Framework**: Tailwind CSS
- **Component Styles**: SCSS files per component
- **Default Font Size**: `text-sm`
- **Input Styles**: `px-3 py-3`
- **Button Style**: Gradient duotone, medium size
- **Icons**: SVG files stored in `src/assets/images/svgs/`

## 📝 Code Style

### TypeScript
- Strict typing enabled
- Explicit types for all variables and functions
- Avoid `any` type
- Use interfaces for data structures
- Use `readonly` where applicable

### Angular
- Standalone components preferred
- Use `inject()` for dependency injection
- Angular Signals for reactive state
- Use `@if`, `@for` control flow syntax
- Functional reactive patterns

### Naming Conventions
- **PascalCase**: Classes, interfaces, components
- **camelCase**: Variables, functions, methods
- **kebab-case**: File names

### Code Organization
- Services: `src/app/services/`
- Interfaces: `src/app/interfaces/`
- All API calls: `api-service.ts`
- Single responsibility principle
- Short, focused functions

## 🔄 API Integration

All API calls are centralized in `api-service.ts`. The service provides methods for:

- Authentication (login, register)
- Categories (CRUD operations)
- Posts (CRUD, publish/unpublish)
- Tags (CRUD operations)
- Users (CRUD, lock/unlock, password change)
- Files (upload, list, delete)

API responses follow a standard format:
```typescript
interface IBaseResponse<T> {
    data: T;
    message?: string;
    // ... other fields
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify API URL in environment files
   - Check CORS configuration on backend
   - Ensure backend server is running

2. **Authentication Issues**
   - Clear browser storage and re-login
   - Verify token format in request headers
   - Check token expiration

3. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Angular cache: `ng cache clean`

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [RxJS Documentation](https://rxjs.dev)

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For contributions, please contact the project maintainers.

---

**Built with ❤️ using Angular 20**
