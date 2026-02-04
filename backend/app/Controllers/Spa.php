<?php

namespace App\Controllers;

class Spa extends BaseController
{
    public function index()
    {
        // Your React entry file in backend/public
        $index = FCPATH . 'index.html';

        if (!is_file($index)) {
            return $this->response
                ->setStatusCode(500)
                ->setBody("SPA index.html not found at: {$index}");
        }

        return $this->response
            ->setHeader('Content-Type', 'text/html; charset=UTF-8')
            ->setBody(file_get_contents($index));
    }
}
