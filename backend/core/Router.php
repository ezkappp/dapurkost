<?php

/**
 * Router HTTP sederhana tanpa dependency eksternal.
 * Mendukung path parameter dinamis, contoh: /api/menu/{id}
 */
class Router
{
    /** @var array<string, array<int, array{pattern: string, keys: array, handler: callable}>> */
    private array $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => [],
    ];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $keys = [];

        // Ubah "/api/menu/{id}" menjadi regex "#^/api/menu/(?<id>[^/]+)$#"
        $pattern = preg_replace_callback('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', function ($match) use (&$keys) {
            $keys[] = $match[1];

            return '(?<' . $match[1] . '>[^/]+)';
        }, $path);

        $pattern = '#^' . rtrim($pattern, '/') . '/?$#';

        $this->routes[$method][] = [
            'pattern' => $pattern,
            'keys' => $keys,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = '/' . ltrim($path, '/');
        $path = $path === '/' ? '/' : rtrim($path, '/');

        if (!isset($this->routes[$method])) {
            Response::error('Method tidak didukung.', 405);

            return;
        }

        foreach ($this->routes[$method] as $route) {
            if (preg_match($route['pattern'], $path, $matches)) {
                $params = [];

                foreach ($route['keys'] as $key) {
                    $params[$key] = $matches[$key];
                }

                call_user_func($route['handler'], $params);

                return;
            }
        }

        Response::error('Endpoint tidak ditemukan: ' . $method . ' ' . $path, 404);
    }
}
