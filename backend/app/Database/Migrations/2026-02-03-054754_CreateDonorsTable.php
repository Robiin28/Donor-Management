<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDonorsTable extends Migration
{
public function up()
{
    $this->forge->addField([
        'id' => [
            'type'           => 'INT',
            'constraint'     => 11,
            'unsigned'       => true,
            'auto_increment' => true,
        ],
        'full_name' => [
            'type'       => 'VARCHAR',
            'constraint' => 150,
        ],
        'phone' => [
            'type'       => 'VARCHAR',
            'constraint' => 20,
            'null'       => true,
        ],
        'email' => [
            'type'       => 'VARCHAR',
            'constraint' => 150,
            'null'       => true,
        ],
        'blood_group' => [
            'type'       => 'VARCHAR',
            'constraint' => 5,
        ],
        'address' => [
            'type' => 'TEXT',
            'null' => true,
        ],
        'created_at' => [
            'type' => 'DATETIME',
            'null' => true,
        ],
        'updated_at' => [
            'type' => 'DATETIME',
            'null' => true,
        ],
    ]);

    $this->forge->addKey('id', true);
    $this->forge->createTable('donors', true);
}

public function down()
{
    $this->forge->dropTable('donors', true);
}

}
