<?php

class Database
{
    private static ?PDO $instance = null;

    private function __construct()
    {
    }

    private function __clone()
    {
    }

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            self::$instance = self::createConnection();
        }

        return self::$instance;
    }

    private static function createConnection(): PDO
    {
        $configPath = dirname(__DIR__) . '/config/database.php';

        if (!file_exists($configPath)) {
            throw new RuntimeException('Database configuration file not found.');
        }

        $config = require $configPath;

        if (!is_array($config)) {
            throw new RuntimeException('Database configuration is invalid.');
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $config['host'] ?? '127.0.0.1',
            $config['port'] ?? 3306,
            $config['dbname'] ?? '',
            $config['charset'] ?? 'utf8mb4'
        );

        try {
            $pdo = new PDO(
                $dsn,
                $config['username'] ?? '',
                $config['password'] ?? '',
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );

            return $pdo;
        } catch (PDOException $e) {
            throw new PDOException('Database connection failed: ' . $e->getMessage(), (int) $e->getCode());
        }
    }
}
