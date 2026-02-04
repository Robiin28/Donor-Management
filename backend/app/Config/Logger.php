<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Log\Handlers\FileHandler;
use CodeIgniter\Log\Handlers\HandlerInterface;

/**
 * Logger configuration
 *
 * ✅ Development: log everything (threshold 9)
 * ✅ Production: log errors/warnings only (threshold 4)
 * ✅ Logs are written to: writable/logs/
 */
class Logger extends BaseConfig
{
    /**
     * --------------------------------------------------------------------------
     * Error Logging Threshold
     * --------------------------------------------------------------------------
     *
     * 0 = off, 1..9 as per CI docs (9 = all)
     *
     * @var int|list<int>
     */
    public $threshold = (ENVIRONMENT === 'production') ? 4 : 9;

    /**
     * Date format written to each log line
     */
    public string $dateFormat = 'Y-m-d H:i:s';

    /**
     * --------------------------------------------------------------------------
     * Log Handlers
     * --------------------------------------------------------------------------
     *
     * @var array<class-string<HandlerInterface>, array<string, int|list<string>|string>>
     */
    public array $handlers = [
        FileHandler::class => [
            // Levels this handler will write
            'handles' => [
                'critical',
                'alert',
                'emergency',
                'error',
                'warning',
                'notice',
                'info',
                'debug',
            ],

            /**
             * File extension
             * - 'log' is simple and standard.
             * - You can change to 'php' if logs might be exposed publicly (not recommended).
             */
            'fileExtension' => 'log',

            /**
             * Permissions for newly created log files (octal)
             */
            'filePermissions' => 0644,

            /**
             * Log directory (recommended explicit)
             * This writes to: writable/logs/
             */
            'path' => WRITEPATH . 'logs',
        ],

        /**
         * Optional: also send to PHP error_log (useful on some hosting)
         * Uncomment if you want logs to appear in server error logs too.
         */
        // \CodeIgniter\Log\Handlers\ErrorlogHandler::class => [
        //     'handles' => [
        //         'critical','alert','emergency','error','warning','notice','info','debug'
        //     ],
        //     'messageType' => 0,
        // ],
    ];
}
