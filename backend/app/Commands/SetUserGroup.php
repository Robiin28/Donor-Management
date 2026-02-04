<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class SetUserGroup extends BaseCommand
{
    protected $group       = 'Auth';
    protected $name        = 'auth:set-group';
    protected $description = 'Assign a Shield group to a user by ID.';

    public function run(array $params)
    {
        $userId = (int) ($params[0] ?? 0);
        $group  = (string) ($params[1] ?? '');

        if ($userId < 1 || $group === '') {
            CLI::error('Usage: php spark auth:set-group <userId> <group>');
            return;
        }

        $users = auth()->getProvider();
        $user  = $users->findById($userId);

        if (!$user) {
            CLI::error("User not found: {$userId}");
            return;
        }

        $user->syncGroups($group);
        $users->save($user);

        CLI::write("OK: User {$userId} assigned to group '{$group}'", 'green');
    }
}
