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
     * - In production (Render), set these env vars in Render dashboard:
     *   DB_DRIVER=Postgre
     *   DB_HOST=...
     *   DB_NAME=...
     *   DB_USER=...
     *   DB_PASS=...
     *   DB_PORT=5432
     *   DB_SCHEMA=public
     *   DB_SSLMODE=require   (optional but recommended for Render Postgres)
     *   DB_ENCRYPT=true      (optional)
     */
    public array $default = [
    'DSN'      => '',
    'hostname' => env('DB_HOST', '127.0.0.1'),
    'username' => env('DB_USER', ''),
    'password' => env('DB_PASS', ''),
    'database' => env('DB_NAME', ''),
    'DBDriver' => env('DB_CONNECTION', 'Postgre'),
    'DBPrefix' => '',
    'pConnect' => false,
    'DBDebug'  => (bool) env('CI_DEBUG', false),
    'charset'  => 'utf8',
    'DBCollat' => 'utf8_general_ci',
    'swapPre'  => '',
    'encrypt'  => false,
    'compress' => false,
    'strictOn' => false,
    'failover' => [],
    'port'     => (int) env('DB_PORT', 5432),
];


    /**
     * This database connection is used when running PHPUnit database tests.
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

        // Load from env (Render dashboard). This is the REAL fix.
        // Works whether you use .env locally or Render env vars in production.
        $this->default['DBDriver']  = env('DB_DRIVER', env('database.default.DBDriver', $this->default['DBDriver']));
        $this->default['hostname']  = env('DB_HOST',   env('database.default.hostname', $this->default['hostname']));
        $this->default['database']  = env('DB_NAME',   env('database.default.database', $this->default['database']));
        $this->default['username']  = env('DB_USER',   env('database.default.username', $this->default['username']));
        $this->default['password']  = env('DB_PASS',   env('database.default.password', $this->default['password']));
        $this->default['port']      = (int) env('DB_PORT', env('database.default.port', $this->default['port']));
        $this->default['schema']    = env('DB_SCHEMA', env('database.default.schema', $this->default['schema']));

        // SSL flags (Render Postgres)
        $this->default['encrypt']   = filter_var(
            env('DB_ENCRYPT', env('database.default.encrypt', $this->default['encrypt'])),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );
        if ($this->default['encrypt'] === null) {
            $this->default['encrypt'] = true;
        }

        $this->default['sslmode']   = env('DB_SSLMODE', env('database.default.sslmode', $this->default['sslmode']));

        // Safety: if anything accidentally sets MySQLi, force Postgre unless you truly want MySQL.
        if (strtolower((string) $this->default['DBDriver']) === 'mysqli') {
            $this->default['DBDriver'] = 'Postgre';
        }
    }
}
