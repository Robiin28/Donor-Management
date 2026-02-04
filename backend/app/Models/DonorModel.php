<?php

namespace App\Models;

use CodeIgniter\Model;

class DonorModel extends Model
{
    protected $table      = 'donors';
    protected $primaryKey = 'id';

    // Fields allowed for insert/update
    protected $allowedFields = [
        'full_name',
        'phone',
        'email',
        'blood_group',
        'address',
        'segment',
        'category',
    ];

    // Your API output shows created_at & updated_at exist
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation rules
protected $validationRules = [
    'full_name'   => 'required|min_length[3]|max_length[120]',
    'phone'       => 'permit_empty|min_length[7]|max_length[20]',
    'email'       => 'permit_empty|valid_email|max_length[120]',
    'blood_group' => 'permit_empty|in_list[A+,A-,B+,B-,AB+,AB-,O+,O-]',
    'address'     => 'permit_empty|max_length[255]',
    'segment'     => 'permit_empty|in_list[individual,corporate,foundation]',
    'category'    => 'permit_empty|in_list[recurring,VIP,major]',
];


    protected $validationMessages = [
        'full_name' => [
            'required'   => 'full_name is required',
            'min_length' => 'full_name must be at least 3 characters',
            'max_length' => 'full_name must be at most 120 characters',
        ],
        'phone' => [
            'min_length' => 'phone must be at least 7 characters',
            'max_length' => 'phone must be at most 20 characters',
            'is_unique' => 'phone already exists',
                   ],
        'email' => [
            'valid_email' => 'email must be a valid email address',
            'max_length'  => 'email must be at most 120 characters',
            'is_unique' => 'email already exists',
            ],
        'blood_group' => [
            'in_list' => 'blood_group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
        ],
        'address' => [
            'max_length' => 'address must be at most 255 characters',
        ],
        'segment' => [
            'in_list' => 'segment must be one of: individual, corporate, foundation',
        ],
        'category' => [
            'in_list' => 'category must be one of: recurring, VIP, major',
        ],
    ];

    protected $skipValidation = false;
}
