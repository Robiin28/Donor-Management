<?php

namespace App\Controllers;

class App extends BaseController
{
    public function index()
    {
        $path = FCPATH . 'assets/index.html';

        if (!is_file($path)) {
            return $this->response->setStatusCode(500)->setBody('React build not found. Run: npm run build');
        }

        return $this->response
            ->setHeader('Content-Type', 'text/html')
            ->setBody(file_get_contents($path));
    }
}
