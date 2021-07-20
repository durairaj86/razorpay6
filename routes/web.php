<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Billing\BillingController;
use App\Http\Controllers\Billing\WebhookController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::prefix('billing')->namespace('Billing')->group(function () {

    //Subscription
    Route::prefix('subscription')->group(function () {
        Route::get('create', [BillingController::class, 'create']);
        Route::post('create', [BillingController::class, 'makeSubscription']);
        //Route::post('transaction', [BillingController::class, 'transaction']);
        //Route::get('invoice', [BillingController::class, 'invoice']);
        Route::post('authenticated', [BillingController::class, 'subscriptionAuthenticated']);
        Route::post('update', [BillingController::class, 'updateSubscriptions']);
        //Route::get('payment', [BillingController::class, 'payment']);
        Route::post('webhook', [WebhookController::class, 'handleWebhook']);
        Route::get('{id}/success', [BillingController::class, 'successPage']);
        Route::get('invoice', [BillingController::class, 'invoiceCreate']);
        Route::get('invoice/resend', [BillingController::class, 'invoiceResend']);
        Route::get('payment', [BillingController::class, 'payment']);
        Route::get('invoice2', [WebhookController::class, 'handleInvoicePaid']);
    });

});
