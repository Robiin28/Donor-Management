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
     * NOTE:
     * - Keep this property as "constant-safe" (no env(), no function calls),
     *   because some PHP versions/environments can throw:
     *   "Constant expression contains invalid operations"
     * - We load Render/.env values in __construct().
     *
     * Render recommended env vars:
     *   DB_DRIVER=Postgre
     *   DB_HOST=dpg-xxxxxx-a
     *   DB_PORT=5432
     *   DB_NAME=xxxx
     *   DB_USER=xxxx
     *   DB_PASS=xxxx
     *   DB_SCHEMA=public        (optional)
     *   DB_SSLMODE=require      (optional; sometimes needed)
     *   DB_ENCRYPT=true|false   (optional)
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
        'charset'  => 'utf8',
        'DBCollat' => 'utf8_general_ci',
        'swapPre'  => '',
        'encrypt'  => false,
        'compress' => false,
        'strictOn' => false,
        'failover' => [],
        'port'     => 5432,

        // PostgreSQL-specific options (safe defaults)
        'schema'   => 'public',
        'sslmode'  => 'prefer', // can be "require" on some hosts
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

        // ---- Load from env (Render dashboard or local .env) ----
        // Driver: support DB_DRIVER, fall back to DB_CONNECTION
        $driver = env('DB_DRIVER', env('DB_CONNECTION', $this->default['DBDriver']));
        if ($driver) {
            $this->default['DBDriver'] = $driver;
        }

        // Host/user/pass/db/port
        $this->default['hostname'] = env('DB_HOST', $this->default['hostname']);
        $this->default['database'] = env('DB_NAME', $this->default['database']);
        $this->default['username'] = env('DB_USER', $this->default['username']);
        $this->default['password'] = env('DB_PASS', $this->default['password']);
        $this->default['port']     = (int) env('DB_PORT', (string) $this->default['port']);

        // Optional schema + sslmode
        $this->default['schema']  = env('DB_SCHEMA', $this->default['schema']);
        $this->default['sslmode'] = env('DB_SSLMODE', $this->default['sslmode']);

        // Optional encrypt flag (boolean-friendly)
        $enc = env('DB_ENCRYPT', null);
        if ($enc !== null) {
            $val = filter_var($enc, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($val !== null) {
                $this->default['encrypt'] = $val;
            }
        }

        // Debug flag from CI_DEBUG
        $this->default['DBDebug'] = (bool) env('CI_DEBUG', false);

        // Safety: if something accidentally sets MySQLi, force Postgre unless you truly want MySQL
        if (strtolower((string) $this->default['DBDriver']) === 'mysqli') {
            $this->default['DBDriver'] = 'Postgre';
        }
    }
}
