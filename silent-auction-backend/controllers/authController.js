import User from "../models/User.js";

// 不再需要 bcrypt、jwt，可以删掉这两行
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    user = new User({
      name,
      email,
      password, // 明文保存密码
      role
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // 明文直接比对密码
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 不再生成 token，直接返回用户信息
    res.json({ user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
