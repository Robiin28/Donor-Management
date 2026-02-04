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

        // These are not important for Postgres but are fine to keep
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
        // FIX FOR RENDER:
        // Render usually provides DATABASE_URL like:
        // postgres://user:pass@host:5432/dbname
        // If we don't read it, CI keeps using 127.0.0.1 and fails.
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

                if (array_key_exists('pass', $parts)) {
                    // pass can be empty string, keep it as-is
                    $this->default['password'] = (string) $parts['pass'];
                }

                if (!empty($parts['path'])) {
                    $this->default['database'] = ltrim($parts['path'], '/');
                }

                // Keep SSL requirement for managed Postgres
                $this->default['sslmode'] = env('database.default.sslmode', 'require');
                $this->default['schema']  = env('database.default.schema', 'public');

                // DBDebug can be true/false string
                $this->default['DBDebug'] = filter_var(
                    env('database.default.DBDebug', $this->default['DBDebug']),
                    FILTER_VALIDATE_BOOLEAN
                );

                // Done: DATABASE_URL overrides everything else
                return;
            }
        }

        // ---------------------------------------------------------
        // Fallback: use env keys you may set manually on Render
        // ---------------------------------------------------------
        $this->default['hostname'] = env('database.default.hostname', $this->default['hostname']);
        $this->default['username'] = env('database.default.username', $this->default['username']);
        $this->default['password'] = env('database.default.password', $this->default['password']);
        $this->default['database'] = env('database.default.database', $this->default['database']);
        $this->default['DBDriver'] = env('database.default.DBDriver', $this->default['DBDriver']);
        $this->default['DBPrefix'] = env('database.default.DBPrefix', $this->default['DBPrefix']);

        $this->default['pConnect'] = filter_var(
            env('database.default.pConnect', $this->default['pConnect']),
            FILTER_VALIDATE_BOOLEAN
        );

        $this->default['port'] = (int) env('database.default.port', (string) $this->default['port']);

        $this->default['schema']  = env('database.default.schema', $this->default['schema']);
        $this->default['sslmode'] = env('database.default.sslmode', $this->default['sslmode']);

        $this->default['DBDebug'] = filter_var(
            env('database.default.DBDebug', $this->default['DBDebug']),
            FILTER_VALIDATE_BOOLEAN
        );

        // Extra safety: force Postgre if anything weird happens
        if (strtolower((string) $this->default['DBDriver']) === 'mysqli') {
            $this->default['DBDriver'] = 'Postgre';
        }
    }
}
