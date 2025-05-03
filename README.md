#  Pinterest Clone

A full-stack Pinterest-like application built with **Node.js**, **Express**, **MongoDB**, and **EJS**. Users can register, log in, create boards, and post images or videos. A global feed displays posts from all users, and posts can be saved as personal pins.

---

##  Features

-  **User Authentication** (Register/Login)
-  **Create Boards**
-  **Upload Posts** (Image or Video)
-  **Feed Page** (See others' posts)
-  **Save Pins** (Saved posts appear in your personal saved list)
-  **Future Scope**: Post search, following system, profile discovery

---

##  Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML, CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Local Strategy)
- **File Uploads**: Multer

---

##  Folder Structure

Pinterest-Clone/
│
├── routes/ # Express route handlers and also mongoose models (Mongoose Models should actually be in models folder)
├── views/ # EJS templates
├── public/
| ├── images
│ │ ├── uploads/ # Uploaded post files (I have removed the folder, so should first add the folder in images folder and then run)
│ ├── stylesheets/ # CSS files
│ └── javascripts/ # Frontend JS
├── app.js # Main Express app
└── package.json

---

##  Installation & Running Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/Pinterest-Clone.git
   cd pinterest-clone

2. **Install Dependencies**
   ```bash
   npm install

3. **Create a .env file**
   MONGODB_URI=your mongodb connection string

4. **Run the APP**
   npx nodemon

5. **Open in Browser**
   http://localhost:3000

## Future Improvements
- Add search functionality to find posts by title
- Add user discovery with follow/following system
- Enable comments or likes on posts
- Improve feed relevance based on user activity

## Contributing
Contributions, issues, and feature requests are welcome!
Feel free to fork the repo and submit a pull request.

## Contact
Made by Jerin P Isac
Email: jerinpisac@gmail.com
