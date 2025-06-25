#  Jottify Story project - Node Express App

**Objective**: Build a full-stack Story App where users can sign up, log in, and create personal stories (diary, travel, fictional, learning stories or any topic) with support for image uploads, story metadata (date, tags), and features like search, filtering by date, pinning favorites, and editing/deleting stories.

The Jottify Story App is accessible online at: [APP DEPLOY](https://jottify-node-express-app.onrender.com/)

## Features

- User Registration and Login (JWT-based authentication)
- Create, Edit, Delete Stories
- Story metadata support (Date, Tags)
- Image Upload for each story
- Filter by Date or Tag
- Mark stories as Favorites
- Live Search (title, description, or tags)
- Responsive UI with Card & Table views
- RESTful API backend with Swagger documentation
- Full CRUD operations with real-time feedback
- Secure routes for authenticated users

## Tech Stack
- **Backend:** Node.js with Express.js
- **Frontend:** HTML, JavaScript
- **Database:** MongoDB 
- **Authentication:** JWT (JSON Web Tokens)
- **API Documentation:** Swagger UI
- **Styling:** CSS3 / Flexbox / Responsive Design
- **Image Uploads:** Cloudinary / Multer / Streamifier 
- **Logging:** Morgan (HTTP request logging)
- **Security:** Helmet / xss-clean / express-rate-limit
- **Deployment/Hosting:** Render
- **Version Control:** Git & GitHub

## API Documentation
After starting the backend, visit endpoint `/docs`

Swagger UI provides interactive API documentation.

## Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB 5+
- Cloudinary account (for image uploads)

## Installation
To get a copy of this project running on your local machine, follow these steps:

1. Clone the repo

```bash
    git clone https://github.com/your-username/jottify-app.git
    cd jottify-node-express-app 
```
2. Install server dependencies
```bash
    npm install
```
3. Configure environment
```bash
    cp .env.example .env
```

Edit .env with your credentials

4. Start the servers
```bash
    npm start or node app.js
```
5. Open the app in browser. Sign Up and Write! Dream! Joy!

## License

MIT License - see LICENSE.md for details.

