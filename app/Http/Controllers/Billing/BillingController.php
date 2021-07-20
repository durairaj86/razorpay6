<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\Plan;
use App\Models\User;
use App\Traits\Billing\Subscriptions;
use Carbon\Carbon;
use Illuminate\Support\Facades\Request;

class BillingController extends Controller
{
    use Subscriptions;

    public function create()
    {
        return view('subscription', ['plans' => $this->lcsPlans()]);
    }

    public function lcsPlans()
    {
        return Plan::all();
    }

    /*public function payment()
    {
        return view('payment');
    }*/

    public function successPage($id = false)
    {
        $paymentDetails = $this->paymentDetails($id);
        dd($paymentDetails);

        //$invoice = $this->invoiceData($paymentDetails->invoice_id);
        //$invoice->issue();
    }

    public function invoice()
    {
        $customerId = 'cust_HXBx6H3KEhUazg';
        $data = array(
            'type' => 'invoice',
            'date' => Carbon::now(),
            //'customer_id' => $customerId,
            'email_notify' => 1,
            'line_items' => array(
                [
                    'name' => 'Master Cloud Computing in 30 Days',
                    'description' => 'Invoice for the month of July 2021',
                    'amount' => 10000,
                    'quantity' => 1,
                ]
            ),
        );
        $getSubscription = User::query()->where('razorpay_id', $customerId)->first();
        $invoice = $getSubscription->invoice($data);
        dd($invoice);
    }

    public function payment()
    {
        $customerId = 'cust_HXBx6H3KEhUazg';
        $data = array(
            'amount' => '2000',
            'currency' => 'INR',
            //'customer_id' => $customerId,
            'reference_id' => 'sub_HYt5kQGsMDjEae',
            'description' => 'Payment for policy no #23456',
            "notify" => array(
                [
                    "sms" => true,
                    "email" => true
                ]
            ),
            "reminder_enable" => true,
        );
        $getSubscription = User::query()->where('razorpay_id', $customerId)->first();
        $payment = $getSubscription->payment_links($data);
        dd($payment);
    }
}
