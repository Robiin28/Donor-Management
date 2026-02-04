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

    /**
     * Standard error response helper.
     *
     * In production:
     * - Returns a safe generic message
     * - ALWAYS logs the real exception server-side (Render logs)
     */
    protected function fail(
        string $message,
        int $code = 400,
        mixed $errors = null,
        \Throwable $e = null
    ): ResponseInterface {
        $isProd = (ENVIRONMENT === 'production');

        // A simple request id to correlate client errors with server logs
        $requestId = bin2hex(random_bytes(8));

        // Always log exceptions (especially in production)
        if ($e) {
            log_message('error', '[{id}] API Exception: {exception}: {msg} in {file}:{line}', [
                'id'        => $requestId,
                'exception' => get_class($e),
                'msg'       => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ]);

            // Log a shorter trace (Render logs can get huge)
            log_message('error', '[{id}] Trace: {trace}', [
                'id'    => $requestId,
                'trace' => $e->getTraceAsString(),
            ]);
        } else {
            // If no exception object was passed, still log what we can
            log_message('error', '[{id}] API Fail: {code} {msg}', [
                'id'   => $requestId,
                'code' => $code,
                'msg'  => $message,
            ]);
        }

        $safeMessage = $isProd ? 'Something went wrong. Please try again.' : $message;

        $payload = [
            'status'     => 'error',
            'message'    => $safeMessage,
            'errors'     => $isProd ? null : $errors,
            'request_id' => $requestId, // safe to expose
        ];

        // Only expose debug details outside production
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
