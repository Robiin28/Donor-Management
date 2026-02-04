<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class DebugController extends Controller
{
    public function env()
    {
        $db = config('Database')->default ?? [];

        return $this->response->setJSON([
            'has_DATABASE_URL' => (bool) getenv('DATABASE_URL'),
            'DATABASE_URL_head' => getenv('DATABASE_URL') ? substr(getenv('DATABASE_URL'), 0, 25) . '...' : null,

            // what CI config is ACTUALLY using
            'active' => [
                'DBDriver'  => $db['DBDriver']  ?? null,
                'hostname'  => $db['hostname']  ?? null,
                'port'      => $db['port']      ?? null,
                'database'  => $db['database']  ?? null,
                'username'  => isset($db['username']) ? 'SET' : null,
                'password'  => isset($db['password']) ? 'SET' : null,
                'sslmode'   => $db['sslmode']   ?? null,
                'schema'    => $db['schema']    ?? null,
            ],

            // check if your manual env keys exist
            'manual_env' => [
                'database.default.hostname' => getenv('database.default.hostname') ?: null,
                'database.default.port'     => getenv('database.default.port') ?: null,
                'database.default.database' => getenv('database.default.database') ?: null,
            ],
        ]);
    }
}
