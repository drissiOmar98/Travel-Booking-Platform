# 🌍 Travel Booking Platform

## 📚 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)

## 📝 Overview
**Travel Booking Platform** is a comprehensive full-stack application designed for managing travel bookings and reservations. Developed using **Spring Boot** for robust backend services, it leverages **Angular** for a dynamic and responsive frontend experience. The platform seamlessly integrates **PrimeNG** to deliver an elegant user interface and employs **Auth0** for secure authentication 🔑 and role-based access control, ensuring that users have a safe and personalized experience.


## Key Features

### User Management
- **🔐 Authentication & Authorization**: Secure user access with **Auth0** using OAuth2 protocols, ensuring safe data transactions.
- **👥 Role Management**: Comprehensive role-based access control for different user types, such as travelers and landlords.

### Booking Management
- **📅 Traveler Booking Management**: 
  - Seamlessly manage bookings with options for retrieval, viewing details, and cancellation.
  - **🛠️ Advanced Booking Creation**: Easy-to-use interface for creating new bookings, including availability checks.
- **🏠 Landlord Reservation Management**: 
  - Tools for landlords to oversee property reservations and manage bookings efficiently.
  - **📊 Booking Statistics**: Insights into booking patterns and performance for better decision-making.

### Listing Management
- **📋 Comprehensive Listing Details**: 
  - Detailed property views with enhanced category filtering and pagination support.
  - **✅ Dynamic Validation**: Real-time validation for listing title, description, and pricing inputs to maintain data integrity.
- **🖼️ Image Management**: 
  - Robust image upload functionality with validation logic and display mechanisms for property images.
  - **🗺️ Map Integration**: Use of Leaflet for interactive location selection, with autocomplete functionality for convenience.

- 🔍 **Advanced Search Functionality**: Allows users to search for houses based on various criteria, including:
  - Location
  - Dates (start and end)
  - Number of guests
  - Number of beds and baths

  ### Notifications & Feedback
- **📬 Reactive Toast Notifications**: Informative notifications for user actions, ensuring clarity in user feedback.

### Security & Performance
- **🛡️ Session Management**: 
  - Implementation of HTTP interceptors and route guards for enhanced session handling and security.
  - **🔒 Improved Security Protocols**: OAuth2 integration with role-based authority mapping for robust security.

### Technical Enhancements
- **⚡ Reactive Programming**: Utilizes Angular's signals API for a responsive, reactive user experience across the platform.
- **📈 State Management**: Creation of `State` and `StateBuilder` classes for efficient request handling and state management.

### Additional Functionalities
- **🔄 Listing Management Operations**: 
  - State handling for listing CRUD (Create, Read, Update, Delete) operations, with HTTP methods for fetching, deleting, and displaying listings.
- **📈 Pagination Support**: Pagination for tenant listings, enabling users to navigate through extensive property options easily.
- **🛠️ Signals for Reactive State Management**: Leveraging signals for enhanced state management and form data processing within the application.
- **📅 Calendar Integration**: Enhanced booking form with calendar selection, validation, and total price display for clear booking processes.
- **📋 InfoStep Numeric Controls**: Numeric controls with increment/decrement functionality for easy input adjustments in booking forms.


### Development Principles
- **🏗️ Domain-Driven Design**: Follows best practices for code organization and maintainability, ensuring scalable and adaptable architecture.

## Tech Stack
### **Backend**:
- **Spring Boot 3**: 🥇 Framework for building RESTful APIs and microservices, simplifying the development process with convention over configuration.
- **Java**: ☕ Primary programming language used for backend development, known for its portability and performance.
- **PostgreSQL**: 🗄️ Relational database for robust data storage and management, offering powerful features like ACID compliance.
- **Auth0**: 🔑 Service for authentication and authorization management, providing secure access control for applications.
- **Docker**: 🐳 For containerization and deployment of microservices, ensuring consistent environments across development and production.
- **Spring Security**: 🔒 Comprehensive security framework for securing applications, providing authentication and authorization features.
- **Liquibase**: 💧 Database migration tool for tracking, managing, and applying database changes in a controlled manner.
- **MapStruct**: 🗺️ Java annotation processor for generating type-safe mappers, simplifying data transfer object (DTO) mapping.
- **Okta**: 👤 Identity management service that offers authentication and authorization capabilities, integrating seamlessly with Spring Boot.
- **Lombok**: 📜 Library that helps reduce boilerplate code, improving code readability and maintainability by generating getters, setters, and other common methods automatically.
- **Spring Boot DevTools**: 🛠️ Development tool for enhancing the development experience with features like automatic restarts and live reloads.
- **Spring Boot Test**: 🧪 Provides testing support for Spring components, making it easier to write unit and integration tests.

### **Frontend**:
- **Angular 18**: ⚛️ Framework for building a dynamic single-page application (SPA), allowing for modular and maintainable code.
- **PrimeNG**: 🎨 UI component library for Angular, providing a rich set of responsive UI components that enhance user experience.
- **TypeScript**: 🔤 For type-safe development and enhanced tooling support, ensuring better code quality and maintainability.
- **Bootstrap 5**: 🚀 CSS framework for developing responsive and mobile-first websites quickly and efficiently.
- **RxJS**: ⚡ A library for reactive programming using Observables, enabling asynchronous programming and event handling in Angular applications.
- **@asymmetrik/ngx-leaflet**: 🗺️ Angular wrapper for Leaflet, facilitating map integration and interactive geolocation features in the application.
- **Leaflet**: 📍 A powerful JavaScript library for mobile-friendly interactive maps, enhancing the geographical data presentation.
- **leaflet-geosearch**: 🔍 Library for integrating location-based search capabilities with Leaflet maps.
- **Font Awesome**: ⭐ Icon library for scalable vector icons that can be customized with CSS, enhancing UI aesthetics.
- **Day.js**: 📅 A lightweight JavaScript date library for parsing, validating, manipulating, and displaying dates and times efficiently.
- **PrimeFlex**: 💪 A utility-first CSS framework for rapid UI development, offering a wide array of utility classes for styling components.


