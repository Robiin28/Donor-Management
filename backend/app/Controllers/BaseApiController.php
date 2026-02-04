<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;

class BaseApiController extends BaseController
{
    protected function ok(mixed $data = null, string $message = 'OK'): ResponseInterface
    {
        return $this->response
            ->setStatusCode(200)
            ->setJSON([
                'status'  => 'success',
                'message' => $message,
                'data'    => $data,
            ]);
    }

    protected function created(mixed $data = null, string $message = 'Created'): ResponseInterface
    {
        return $this->response
            ->setStatusCode(201)
            ->setJSON([
                'status'  => 'success',
                'message' => $message,
                'data'    => $data,
            ]);
    }

    protected function fail(
        string $message,
        int $code = 400,
        mixed $errors = null,
        \Throwable $e = null
    ): ResponseInterface {
        $isProd = (ENVIRONMENT === 'production');

        $safeMessage = $isProd ? 'Something went wrong. Please try again.' : $message;

        $payload = [
            'status'  => 'error',
            'message' => $safeMessage,
            'errors'  => $errors,
        ];

        if (!$isProd && $e) {
            $payload['debug'] = [
                'exception' => get_class($e),
                'message'   => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ];
        }

        return $this->response
            ->setStatusCode($code)
            ->setJSON($payload);
    }
}

