<?php

namespace Config;

use CodeIgniter\Database\Config;

/**
 * Database Configuration
 */
class Database extends Config
{
    /**
     * The directory that holds the Migrations and Seeds directories.
     */
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;

    /**
     * Lets you choose which connection group to use if no other is specified.
     */
    public string $defaultGroup = 'default';

    /**
     * The default database connection.
     *
     * IMPORTANT:
     * Keep this property constant-safe (no env(), no function calls),
     * then load env vars in __construct().
     */
    public array $default = [
        'DSN'      => '',
        'hostname' => '127.0.0.1',
        'username' => '',
        'password' => '',
        'database' => '',
        'DBDriver' => 'Postgre',
        'DBPrefix' => '',
        'pConnect' => false,
        'DBDebug'  => false,

        // Not important for Postgres, but safe to keep
        'charset'  => 'utf8',
        'DBCollat' => 'utf8_general_ci',

        'swapPre'  => '',
        'compress' => false,
        'strictOn' => false,
        'failover' => [],
        'port'     => 5432,

        // Postgres extras
        'schema'   => 'public',
        'sslmode'  => 'require',
    ];

    /**
     * PHPUnit testing connection
     *
     * @var array<string, mixed>
     */
    public array $tests = [
        'DSN'         => '',
        'hostname'    => '127.0.0.1',
        'username'    => '',
        'password'    => '',
        'database'    => ':memory:',
        'DBDriver'    => 'SQLite3',
        'DBPrefix'    => 'db_',
        'pConnect'    => false,
        'DBDebug'     => true,
        'charset'     => 'utf8',
        'DBCollat'    => '',
        'swapPre'     => '',
        'encrypt'     => false,
        'compress'    => false,
        'strictOn'    => false,
        'failover'    => [],
        'port'        => 3306,
        'foreignKeys' => true,
        'busyTimeout' => 1000,
        'synchronous' => null,
        'dateFormat'  => [
            'date'     => 'Y-m-d',
            'datetime' => 'Y-m-d H:i:s',
            'time'     => 'H:i:s',
        ],
    ];

    public function __construct()
    {
        parent::__construct();

        // Switch to SQLite tests connection when running PHPUnit
        if (ENVIRONMENT === 'testing') {
            $this->defaultGroup = 'tests';
            return;
        }

        // ---------------------------------------------------------
        // 1) Prefer DATABASE_URL if present (Render sometimes provides it)
        // Example: postgres://user:pass@host:5432/dbname
        // ---------------------------------------------------------
        $dbUrl = env('DATABASE_URL');

        if (!empty($dbUrl)) {
            $parts = parse_url($dbUrl);

            if (is_array($parts)) {
                $this->default['DBDriver'] = 'Postgre';

                if (!empty($parts['host'])) {
                    $this->default['hostname'] = $parts['host'];
                }

                if (!empty($parts['port'])) {
                    $this->default['port'] = (int) $parts['port'];
                }

                if (!empty($parts['user'])) {
                    $this->default['username'] = $parts['user'];
                }

                // pass can be empty string, keep it as-is if provided
                if (array_key_exists('pass', $parts)) {
                    $this->default['password'] = (string) $parts['pass'];
                }

                if (!empty($parts['path'])) {
                    $this->default['database'] = ltrim($parts['path'], '/');
                }

                // Query string may include sslmode
                $query = [];
                if (!empty($parts['query'])) {
                    parse_str($parts['query'], $query);
                }

                // Defaults for managed Postgres
                $this->default['schema']  = env('DB_SCHEMA', $this->default['schema']);
                $this->default['sslmode'] = $query['sslmode'] ?? env('DB_SSLMODE', $this->default['sslmode']);

                // Debug toggle (optional)
                $this->default['DBDebug'] = filter_var(
                    env('DB_DEBUG', $this->default['DBDebug']),
                    FILTER_VALIDATE_BOOLEAN
                );

                return; // DATABASE_URL wins
            }
        }

        // ---------------------------------------------------------
        // 2) Fallback: use simple env vars (recommended on Render)
        // ---------------------------------------------------------
        $this->default['hostname'] = env('DB_HOST', $this->default['hostname']);
        $this->default['port']     = (int) env('DB_PORT', (string) $this->default['port']);
        $this->default['database'] = env('DB_NAME', $this->default['database']);
        $this->default['username'] = env('DB_USER', $this->default['username']);
        $this->default['password'] = env('DB_PASS', $this->default['password']);

        $this->default['schema']   = env('DB_SCHEMA', $this->default['schema']);
        $this->default['sslmode']  = env('DB_SSLMODE', $this->default['sslmode']);

        // Optional debug key
        $this->default['DBDebug'] = filter_var(
            env('DB_DEBUG', $this->default['DBDebug']),
            FILTER_VALIDATE_BOOLEAN
        );

        // Hard force correct driver
        $this->default['DBDriver'] = 'Postgre';
    }
}
