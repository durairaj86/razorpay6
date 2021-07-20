<?php

namespace App\Traits\Billing;

use App\Models\Billing\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use App\Models\Billing\Subscription;
use App\Http\Controllers\Billing\SubscriptionBuilder;

trait Subscriptions
{
    use Billable;

    public function makeSubscription()
    {
        $request = Request::all();
        $planId = $request['plan'];
        $getSubscription = User::query()->where('id', 1)->first();
        //$getSubscription->createCustomer();

        $subscription = $getSubscription->subscriptions()->first();
        if (optional($subscription)->status == 'created' && $planId != optional($subscription)->razorpay_plan) {
            $subscription->cancelNow();
            $getSubscription->newSubscription('default', $planId);
        } elseif (optional($subscription)->status !== 'created') {
            $getSubscription->newSubscription('default', $planId);
        }
        $subscription = $getSubscription->subscriptions()->first();
        return [
            'subscription' => $subscription->razorpay_id,
            'plan' => Plan::where('plan_id', $subscription->razorpay_plan)->select('name', 'description')->first(),
        ];
    }

    public function subscriptionAuthenticated()
    {
        $request = Request::all();
        $subscription_id = $request['subscription_id'];
        $subscription = Subscription::query()->where('razorpay_id', $subscription_id)->first();
        return $subscription->markAsAuthenticated();
    }

    public function updateSubscriptions()
    {
        $request = Request::all();
        $customerId = 'cust_HXBx6H3KEhUazg';
        $plan = $request['plan'];
        $quantity = 2;
        $total_count = 3;
        $getSubscription = User::query()->where('razorpay_id', $customerId)->first();
        $subscription = $getSubscription->subscriptions()->first();
        $data = [
            'name' => 'default',
            'subscription_id' => $subscription->razorpay_id,
            'plan_id' => $plan ? $plan : $subscription->razorpay_plan,
            'quantity' => $quantity ? $quantity : $subscription->quantity,
            'total_count' => $total_count ? $total_count : $subscription->total_count,
        ];
        $getSubscription->updateSubscription($data);
        dd($subscription);
    }
}
