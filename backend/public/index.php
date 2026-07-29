<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/core/Request.php';
require_once dirname(__DIR__) . '/core/Response.php';
require_once dirname(__DIR__) . '/core/Router.php';
require_once dirname(__DIR__) . '/core/Session.php';
require_once dirname(__DIR__) . '/modules/auth/Auth.php';
require_once dirname(__DIR__) . '/modules/auth/AuthController.php';
require_once dirname(__DIR__) . '/modules/menu/MenuController.php';
require_once dirname(__DIR__) . '/modules/paket/PaketController.php';
require_once dirname(__DIR__) . '/modules/pelanggan/PelangganController.php';
require_once dirname(__DIR__) . '/modules/pesanan/PesananController.php';
require_once dirname(__DIR__) . '/modules/pembayaran/PembayaranController.php';
require_once dirname(__DIR__) . '/modules/laporan/LaporanController.php';

Session::start();

// CORS untuk kebutuhan development (aman walau frontend & backend satu domain).
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$method = Request::method();

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Hitung path relatif terhadap folder script ini (backend/public), supaya
// tetap bekerja baik diakses sebagai .../index.php/api/auth/login (tanpa
// .htaccess) maupun .../api/auth/login (dengan rewrite .htaccess).
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

$path = $requestPath;
if ($scriptDir !== '/' && str_starts_with($path, $scriptDir)) {
    $path = substr($path, strlen($scriptDir));
}
$path = preg_replace('#^/index\.php#', '', $path);

if ($path === '' || $path === false) {
    $path = '/';
}

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    Response::error('Koneksi database gagal.', 500, ['detail' => $e->getMessage()]);
    exit;
}

$router = new Router();

// ---------- AUTH ----------
$authController = new AuthController($pdo);
$router->post('/api/auth/login', [$authController, 'login']);
$router->post('/api/auth/logout', [$authController, 'logout']);
$router->get('/api/auth/me', [$authController, 'me']);
$router->post('/api/auth/register', [$authController, 'register']);

// ---------- MENU ----------
$menuController = new MenuController($pdo);
$router->get('/api/menu', [$menuController, 'index']);
$router->get('/api/menu/{id}', [$menuController, 'show']);
$router->post('/api/menu', [$menuController, 'store']);
$router->put('/api/menu/{id}', [$menuController, 'update']);
$router->delete('/api/menu/{id}', [$menuController, 'destroy']);

// ---------- PAKET ----------
$paketController = new PaketController($pdo);
$router->get('/api/paket', [$paketController, 'index']);
$router->get('/api/paket/{id}', [$paketController, 'show']);
$router->post('/api/paket', [$paketController, 'store']);
$router->put('/api/paket/{id}', [$paketController, 'update']);
$router->delete('/api/paket/{id}', [$paketController, 'destroy']);

// ---------- PELANGGAN ----------
$pelangganController = new PelangganController($pdo);
$router->get('/api/pelanggan', [$pelangganController, 'index']);
$router->get('/api/pelanggan/{id}', [$pelangganController, 'show']);
$router->put('/api/pelanggan/{id}', [$pelangganController, 'update']);
$router->delete('/api/pelanggan/{id}', [$pelangganController, 'destroy']);

// ---------- PESANAN ----------
$pesananController = new PesananController($pdo);
$router->get('/api/pesanan', [$pesananController, 'index']);
$router->get('/api/pesanan/{id}', [$pesananController, 'show']);
$router->post('/api/pesanan', [$pesananController, 'store']);
$router->put('/api/pesanan/{id}/status', [$pesananController, 'updateStatus']);

// ---------- PEMBAYARAN ----------
$pembayaranController = new PembayaranController($pdo);
$router->get('/api/pembayaran', [$pembayaranController, 'index']);
$router->post('/api/pembayaran', [$pembayaranController, 'store']);
$router->put('/api/pembayaran/{id}/verifikasi', [$pembayaranController, 'verifikasi']);
$router->delete('/api/pembayaran/{id}', [$pembayaranController, 'destroy']);

// ---------- LAPORAN ----------
$laporanController = new LaporanController($pdo);
$router->get('/api/laporan/ringkasan', [$laporanController, 'ringkasan']);
$router->get('/api/laporan/pendapatan-bulanan', [$laporanController, 'pendapatanBulanan']);
$router->get('/api/laporan/pesanan-mingguan', [$laporanController, 'pesananMingguan']);
$router->get('/api/laporan/menu-terlaris', [$laporanController, 'menuTerlaris']);
$router->get('/api/laporan/paket-favorit', [$laporanController, 'paketFavorit']);

// Root check, supaya index.php tetap bisa dites langsung di browser.
$router->get('/', function () use ($pdo) {
    Response::success('DapurKost API siap.', [
        'database_connected' => true,
        'modules_active' => ['auth', 'menu', 'paket', 'pelanggan', 'pesanan', 'pembayaran', 'laporan'],
    ]);
});

$router->dispatch($method, $path);
