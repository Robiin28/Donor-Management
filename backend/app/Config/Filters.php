<?php

namespace Config;

use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;

class Filters extends BaseFilters
{
    public array $aliases = [
        'csrf'    => CSRF::class,
        'toolbar' => DebugToolbar::class,

        // ✅ CORS (custom filter)
        'cors'    => \App\Filters\CorsFilter::class,
    ];

    /**
     * ✅ Apply CORS globally to ALL requests (API + browser)
     */
    public array $globals = [
        'before' => [
            'cors',
            // 'csrf', // keep OFF for APIs unless you configure it
        ],
        'after' => [
            'cors',
            'toolbar',
        ],
    ];

    /**
     * ❌ REMOVE required filters completely
     * They are causing your "pagecache / forcehttps" errors.
     */
    public array $required = [];

    public array $methods = [];
    public array $filters = [];
}
