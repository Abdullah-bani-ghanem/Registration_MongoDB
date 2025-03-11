const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // تأكد أن المسار صحيح
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🟢 التحقق من إدخال جميع البيانات المطلوبة
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 تحقق مما إذا كان البريد الإلكتروني مسجلًا بالفعل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 إنشاء مستخدم جديد
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // التحقق من وجود المستخدم
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // إنشاء توكن JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // إرسال التوكن عبر الكوكيز
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;




// const express = require("express");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const router = express.Router();

// // تسجيل المستخدم
// router.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const user = new User({ username, email, password });
//     await user.save();
//     res.status(201).send("User registered successfully");
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // تسجيل الدخول
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid password" });

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.cookie("token", token, { httpOnly: true, secure: true });
//     res.json({ message: "Logged in successfully" });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });






// const authenticateToken = (req, res, next) => {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "Access denied" });
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) return res.status(403).json({ message: "Invalid token" });
//       req.user = user;
//       next();
//     });
//   };
  
//   // مسار الملف الشخصي المحمي
//   router.get("/profile", authenticateToken, async (req, res) => {
//     const user = await User.findById(req.user.userId).select("-password");
//     res.json(user);
//   });
  

// module.exports = router;
