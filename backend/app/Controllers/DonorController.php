<?php

namespace App\Controllers;

use App\Models\DonorModel;
use CodeIgniter\HTTP\ResponseInterface;

class DonorController extends BaseApiController
{
    protected DonorModel $donorModel;

    public function __construct()
    {
        $this->donorModel = new DonorModel();
    }

    /**
     * GET /api/donors
     */
    public function index(): ResponseInterface
    {
        try {
            // Query params
            $page    = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 20);

            // Safety limits
            if ($page < 1) $page = 1;
            if ($perPage < 1) $perPage = 20;
            if ($perPage > 100) $perPage = 100;

            // Optional filters
            $segment  = trim((string) ($this->request->getGet('segment') ?? ''));
            $category = trim((string) ($this->request->getGet('category') ?? ''));
            $search   = trim((string) ($this->request->getGet('search') ?? ''));

            // Start query
            $builder = $this->donorModel->orderBy('id', 'DESC');

            // Apply filters if provided (only safe if columns exist in DB)
            if ($segment !== '') {
                $builder->where('segment', $segment);
            }

            if ($category !== '') {
                $builder->where('category', $category);
            }

            // Apply search if provided (name/phone/email)
            if ($search !== '') {
                $builder->groupStart()
                        ->like('full_name', $search)
                        ->orLike('phone', $search)
                        ->orLike('email', $search)
                        ->groupEnd();
            }

            $donors = $builder->paginate($perPage, 'default', $page);
            $pager  = $this->donorModel->pager;
            
            // Prevent confusing 0 page_count for frontend
           

            $total = $pager->getTotal();
            $pageCount = $pager->getPageCount();

            // Prevent confusing 0 page_count for frontend
            if ($pageCount < 1) {
                $pageCount = 1;
            }

            $message = ($total === 0) ? 'No donors found' : 'Donors fetched';

            return $this->ok([
                'items' => $donors,
                'meta'  => [
                    'page'       => $page,
                    'per_page'   => $perPage,
                    'total'      => $total,
                    'page_count' => $pageCount,
                ],
            ], $message);

        } catch (\Throwable $e) {
            return $this->fail('Failed to fetch donors', 500, null, $e);
        }
    }

    /**
     * GET /api/donors/{id}
     */
    public function show(int $id): ResponseInterface
    {
        try {
            $donor = $this->donorModel->find($id);

            if (!$donor) {
                return $this->fail('Donor not found', 404);
            }

            return $this->ok($donor, 'Donor fetched');
        } catch (\Throwable $e) {
            return $this->fail('Failed to fetch donor', 500, null, $e);
        }
    }

    /**
     * POST /api/donors
     */
    public function store(): ResponseInterface
    {
        try {
            $data = $this->request->getJSON(true);

            if (!is_array($data)) {
                return $this->fail('Invalid JSON payload', 400);
            }

            $insertData = [
                'full_name'   => $data['full_name'] ?? null,
                'phone'       => $data['phone'] ?? null,
                'email'       => $data['email'] ?? null,
                'blood_group' => $data['blood_group'] ?? null,
                'address'     => $data['address'] ?? null,
                'segment'     => $data['segment'] ?? null,
                'category'    => $data['category'] ?? null,
            ];

            if (!$this->donorModel->insert($insertData)) {
                return $this->fail('Validation failed', 422, $this->donorModel->errors());
            }
               $id = $this->donorModel->getInsertID();
               $donor = $this->donorModel->find($id);
            return $this->created($donor, 'Donor created');
        } catch (\Throwable $e) {
            return $this->fail('Failed to create donor', 500, null, $e);
        }
    }

    /**
     * PUT /api/donors/{id}
     */
    public function update(int $id): ResponseInterface
    {
        try {
            $existing = $this->donorModel->find($id);

            if (!$existing) {
                return $this->fail('Donor not found', 404);
            }

            $data = $this->request->getJSON(true);

            if (!is_array($data)) {
                return $this->fail('Invalid JSON payload', 400);
            }

            // Safe defaults even if DB doesn't have segment/category yet
            $existingSegment  = array_key_exists('segment', $existing) ? $existing['segment'] : null;
            $existingCategory = array_key_exists('category', $existing) ? $existing['category'] : null;
          
            //need validation again cant be used with create
            $this->donorModel->setValidationRules([
                'full_name'   => 'permit_empty|min_length[3]|max_length[120]',
                'phone'       => "permit_empty|min_length[7]|max_length[20]|is_unique[donors.phone,id,{$id}]",
                'email'       => "permit_empty|valid_email|max_length[120]|is_unique[donors.email,id,{$id}]",
                'blood_group' => 'permit_empty|in_list[A+,A-,B+,B-,AB+,AB-,O+,O-]',
                'address'     => 'permit_empty|max_length[255]',
                'segment'     => 'permit_empty|in_list[individual,corporate,foundation]',
                'category'    => 'permit_empty|in_list[recurring,VIP,major]',
            ]);
            $updateData = [
                'full_name'   => $data['full_name'] ?? $existing['full_name'],
                'phone'       => $data['phone'] ?? $existing['phone'],
                'email'       => $data['email'] ?? $existing['email'],
                'blood_group' => $data['blood_group'] ?? ($existing['blood_group'] ?? null),
                'address'     => $data['address'] ?? $existing['address'],
                'segment'     => $data['segment'] ?? $existingSegment,
                'category'    => $data['category'] ?? $existingCategory,
            ];

            if (!$this->donorModel->update($id, $updateData)) {
                return $this->fail('Validation failed', 422, $this->donorModel->errors());
            }
              $donor =$this->donorModel->find($id);
            return $this->ok($donor, 'Donor updated');
        } catch (\Throwable $e) {
            return $this->fail('Failed to update donor', 500, null, $e);
        }
    }

    /**
     * DELETE /api/donors/{id}
     */
    public function delete(int $id): ResponseInterface
    {
        try {
            $existing = $this->donorModel->find($id);

            if (!$existing) {
                return $this->fail('Donor not found', 404);
            }

            if (!$this->donorModel->delete($id)) {
                return $this->fail('Failed to delete donor', 500);
            }

            return $this->ok(['id'=>$id], 'Donor deleted');
        } catch (\Throwable $e) {
            return $this->fail('Failed to delete donor', 500, null, $e);
        }
    }
    public function create(): ResponseInterface
{
    return $this->ok([
        'defaults' => [
            'full_name'   => '',
            'phone'       => '',
            'email'       => '',
            'blood_group' => null,
            'address'     => '',
            'segment'     => null,
            'category'    => null,
        ],
        'options' => [
            'blood_group' => ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
            'segment'     => ['individual','corporate','foundation'],
            'category'    => ['recurring','VIP','major'],
        ],
    ], 'Donor create metadata');
}

public function edit(int $id): ResponseInterface
{
    $donor = $this->donorModel->find($id);

    if (!$donor) {
        return $this->fail('Donor not found', 404);
    }

    return $this->ok([
        'donor'   => $donor,
        'options' => [
            'blood_group' => ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
            'segment'     => ['individual','corporate','foundation'],
            'category'    => ['recurring','VIP','major'],
        ],
    ], 'Donor edit metadata');
}
public function report(): ResponseInterface
{
    try {
        $db = \Config\Database::connect();

        // Optional filters
        // /api/donors/report?start=2026-01-01&end=2026-02-04
        $start = trim((string) ($this->request->getGet('start') ?? ''));
        $end   = trim((string) ($this->request->getGet('end') ?? ''));

        // Normalize dates
        $startAt = ($start !== '') ? $start . ' 00:00:00' : null;
        $endAt   = ($end !== '')   ? $end   . ' 23:59:59' : null;

        /**
         * 1) TOTAL DONORS
         */
        $totalBuilder = $db->table('donors');

        if ($startAt) $totalBuilder->where('created_at >=', $startAt);
        if ($endAt)   $totalBuilder->where('created_at <=', $endAt);

        $total = (int) $totalBuilder->countAllResults();

        /**
         * 2) BY SEGMENT
         */
        $segBuilder = $db->table('donors')
            ->select(
                "COALESCE(NULLIF(segment, ''), 'unknown') AS segment, COUNT(*) AS count",
                false
            )
            ->groupBy("COALESCE(NULLIF(segment, ''), 'unknown')", false);

        if ($startAt) $segBuilder->where('created_at >=', $startAt);
        if ($endAt)   $segBuilder->where('created_at <=', $endAt);

        $bySegment = [];
        foreach ($segBuilder->get()->getResultArray() as $row) {
            $bySegment[$row['segment']] = (int) $row['count'];
        }

        /**
         * 3) BY CATEGORY
         */
        $catBuilder = $db->table('donors')
            ->select(
                "COALESCE(NULLIF(category, ''), 'unknown') AS category, COUNT(*) AS count",
                false
            )
            ->groupBy("COALESCE(NULLIF(category, ''), 'unknown')", false);

        if ($startAt) $catBuilder->where('created_at >=', $startAt);
        if ($endAt)   $catBuilder->where('created_at <=', $endAt);

        $byCategory = [];
        foreach ($catBuilder->get()->getResultArray() as $row) {
            $byCategory[$row['category']] = (int) $row['count'];
        }

        /**
         * 4) DAILY SERIES (PostgreSQL-safe)
         * Uses created_at::date (works on PostgreSQL)
         */
        $dailyBuilder = $db->table('donors')
            ->select(
                "created_at::date AS day, COUNT(*) AS daily",
                false
            )
            ->groupBy("created_at::date", false)
            ->orderBy("day", "ASC");

        if ($startAt) $dailyBuilder->where('created_at >=', $startAt);
        if ($endAt)   $dailyBuilder->where('created_at <=', $endAt);

        $dailyRows = $dailyBuilder->get()->getResultArray();

        // Build cumulative series
        $cumulative = 0;
        $series = [];

        foreach ($dailyRows as $row) {
            $daily = (int) $row['daily'];
            $cumulative += $daily;

            $series[] = [
                'day'        => $row['day'], // YYYY-MM-DD
                'daily'      => $daily,
                'cumulative' => $cumulative,
            ];
        }

        return $this->ok([
            'total'      => $total,
            'bySegment'  => $bySegment,
            'byCategory' => $byCategory,
            'series'     => $series,
        ], 'Donor report fetched');

    } catch (\Throwable $e) {
        return $this->fail('Failed to fetch donor report', 500, null, $e);
    }
}


}
