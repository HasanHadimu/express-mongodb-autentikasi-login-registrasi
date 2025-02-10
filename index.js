const express = require("express");
const bcrypt = require("bcrypt");  // Pastikan Anda menginstall bcrypt
const app = express();

// Port yang digunakan
const PORT = 2022;

app.use(express.json());  // Middleware untuk parse JSON

// Mengimpor koneksi ke database dan model User
const { connectDB } = require("./db/connection");
const { User } = require("./db/user");

// Menyambungkan ke MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// Endpoint untuk register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;  // Mengambil data dari request body

  try {
    // Cek apakah username sudah terpakai
    const findUser = await User.findOne({ username });

    if (findUser) {
      return res.status(400).json({
        message: "Username has been taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 5);  // gunakan await untuk bcrypt.hash

    // Simpan data user
    await User.create({
      username: username,
      password: hashedPassword,
    });

    // Mengirim response sukses
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Endpoint untuk login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;  // Mengambil data dari request body

  try {
    const findUser = await User.findOne({
      username,
    });

    if (!findUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Verifikasi password dengan bcrypt.compare (asynchronous)
    const isPasswordValid = await bcrypt.compare(password, findUser.password);  // gunakan await untuk bcrypt.compare

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    // Mengirim data user setelah login berhasil, termasuk hash password
    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        username: findUser.username,
        userId: findUser._id,  // Anda bisa menambahkan informasi lain yang diinginkan
        password: findUser.password,  // Tampilkan hash password yang tersimpan
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
