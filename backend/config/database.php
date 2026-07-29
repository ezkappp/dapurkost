<?php

// Kalau environment variable DB tersedia (misal saat di-deploy ke Railway),
// pakai itu. Kalau tidak ada (misal jalan di Laragon lokal), pakai default
// di bawah supaya tidak perlu ubah apa-apa untuk development lokal.
return [
    'host' => getenv('MYSQLHOST') ?: '127.0.0.1',
    'port' => getenv('MYSQLPORT') ?: 3306,
    'dbname' => getenv('MYSQLDATABASE') ?: 'dapurkost_db',
    'username' => getenv('MYSQLUSER') ?: 'root',
    'password' => getenv('MYSQLPASSWORD') ?: '',
    'charset' => 'utf8mb4',
];
