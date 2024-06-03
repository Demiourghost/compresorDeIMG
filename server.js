const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const sharp = require("sharp");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

const db = new sqlite3.Database("./db/ilustraciones.db");

// Configuración de almacenamiento de multer
const storage = multer.memoryStorage(); // Usar almacenamiento en memoria
const upload = multer({ storage: storage });

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, data BLOB)"
  );
});

app.post("/upload", upload.single("file"), (req, res) => {
  const filename = req.file.originalname;

  sharp(req.file.buffer)
    .resize(800, 800, { fit: "inside" }) // Redimensionar la imagen si es necesario
    .jpeg({ quality: 80 }) // Ajustar la calidad de compresión
    .toBuffer()
    .then((data) => {
      db.run(
        "INSERT INTO images (filename, data) VALUES (?, ?)",
        [filename, data],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true });
        }
      );
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/images", (req, res) => {
  db.all("SELECT id, filename FROM images", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get("/image/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT data FROM images WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.set("Content-Type", "image/jpeg"); // Ajusta el tipo MIME según el tipo de imagen
    res.send(row.data);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
