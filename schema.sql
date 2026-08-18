CREATE DATABASE db_kpeg_bpmptp;
USE db_kpeg_bpmptp;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password, role)
    VALUES ('admin34r', '$2b$10$qPe9tILOL2ioTvGiN7Z2mOuW.P5si2NF.JVwNyz0rILBgHQQISvLO', 'admin');

CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE pegawai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE kegiatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kegiatan VARCHAR(255) NOT NULL,
  kategori ENUM('DLT', 'TN', 'DP', 'DLK') NOT NULL,
  waktu_mulai DATETIME NOT NULL,
  waktu_selesai DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  output TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE kegiatan_pegawai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kegiatan_id INT NOT NULL,
  pegawai_id INT NOT NULL,

  FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (pegawai_id) REFERENCES pegawai(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);