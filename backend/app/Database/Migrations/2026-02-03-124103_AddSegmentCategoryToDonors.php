<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSegmentCategoryToDonors extends Migration
{
    public function up()
    {
        $this->forge->addColumn('donors', [
            'segment' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
                'after'      => 'address',
            ],
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
                'after'      => 'segment',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('donors', 'segment');
        $this->forge->dropColumn('donors', 'category');
    }
}
