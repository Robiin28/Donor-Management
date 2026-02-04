<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// -------------------------------------------------
// API ROUTES
// -------------------------------------------------
$routes->group('api', static function (RouteCollection $routes) {

    // DEBUG (TEMP – REMOVE AFTER FIXING DB)
    $routes->get('_env', 'DebugController::env');

    // REPORT (must be before (:num))
    $routes->get('donors/report', 'DonorController::report');

    // CRUD
    $routes->get('donors', 'DonorController::index');
    $routes->post('donors/store', 'DonorController::store');
    $routes->get('donors/(:num)', 'DonorController::show/$1');
    $routes->put('donors/update/(:num)', 'DonorController::update/$1');
    $routes->delete('donors/delete/(:num)', 'DonorController::delete/$1');
});

// -------------------------------------------------
// SPA FALLBACK (ALWAYS LAST)
// -------------------------------------------------
$routes->get('/', 'Spa::index');
$routes->get('(:any)', 'Spa::index');
