<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;

use App\Models\User;
use Carbon\Carbon;
use Razorpay\Api\Entity;

class SubscriptionUpdateBuilder extends Entity
{
    /**
     * The model that is subscribing.
     *
     * @var \Illuminate\Database\Eloquent\Model
     */
    protected $owner;

    /**
     * The name of the subscription.
     *
     * @var string
     */
    protected $name;

    /**
     * The ID of the subscription.
     *
     * @var string
     */
    protected $subscriptionId;

    /**
     * The name of the plan being subscribed to.
     *
     * @var string
     */
    protected $plan;

    /**
     * The customer_notify from being subscribed to.
     *
     * @var string
     */
    protected $customer_notify = 1;

    /**
     * The total_count of the subscription.
     *
     * @var int
     */
    protected $total_count = 1;

    /**
     * The quantity of the subscription.
     *
     * @var int
     */
    protected $quantity = 1;

    /**
     * The date and time the trial will expire.
     *
     * @var \Carbon\Carbon
     */
    protected $trialExpires;

    /**
     * Indicates that the trial should end immediately.
     *
     * @var bool
     */
    protected $skipTrial = false;

    /**
     * The coupon code being applied to the customer.
     *
     * @var string|null
     */
    protected $coupon;

    /**
     * The notes to apply to the subscription.
     *
     * @var array|null
     */
    protected $notes;

    /**
     * Create a new subscription builder instance.
     *
     * @param  mixed  $owner
     * @param  string  $name
     * @param  string  $plan
     *
     * @return void
     */
    public function __construct($owner, $attributes = array())
    {
        $this->name = $attributes['name'];
        $this->plan = $attributes['plan_id'];
        $this->owner = $owner;
        $this->subscriptionId = $attributes['subscription_id'];
        $this->quantity($attributes['quantity']);
        $this->totalCount($attributes['total_count']);
        $this->update();
    }

    protected function getRazorpayClient()
    {
        return resolve('razorpay');
    }

    /**
     * Specify the quantity of the subscription.
     *
     * @param  int  $quantity
     *
     * @return $this
     */
    public function quantity($quantity)
    {
        $this->quantity = $quantity;

        return $this;
    }

    /**
     * Specify the total_count of the subscription.
     *
     * @param  int  $total_count
     *
     * @return $this
     */
    public function totalCount($total_count)
    {
        $this->total_count = $total_count;

        return $this;
    }

    /**
     * Specify whether customer should be notified through razorpay for various events.
     *
     * @param  bool  $customer_notify
     *
     * @return $this
     */
    public function customerNotify($customer_notify = true)
    {
        $this->customer_notify = $customer_notify ? 1 : 0;

        return $this;
    }

    /**
     * Specify the number of days of the trial.
     *
     * @param  int  $trialDays
     *
     * @return $this
     */
    public function trialDays($trialDays)
    {
        $this->trialExpires = Carbon::now()->addDays($trialDays);

        return $this;
    }

    /**
     * Specify the ending date of the trial.
     *
     * @param  \Carbon\Carbon  $trialUntil
     *
     * @return $this
     */
    public function trialUntil(Carbon $trialUntil)
    {
        $this->trialExpires = $trialUntil;

        return $this;
    }

    /**
     * Force the trial to end immediately.
     *
     * @return $this
     */
    public function skipTrial()
    {
        $this->skipTrial = true;

        return $this;
    }

    /**
     * The coupon to apply to a new subscription. //currently not supported in razorpay end to store coupon which can be implemented in client side.
     *
     * @param  string  $coupon
     *
     * @return $this
     */
    public function withCoupon($coupon)
    {
        $this->coupon = $coupon;

        return $this;
    }

    /**
     * The notes to apply to a new subscription.
     *
     * @param  array  $metadata
     *
     * @return $this
     */
    public function withNotes(array $notes)
    {
        $this->notes = $notes;

        return $this;
    }

    public function getStartAtDate()
    {
        $trialEndsAt = null;
        if (!$this->skipTrial) {
            $trialEndsAt = $this->trialExpires;
        }

        return $trialEndsAt;
    }

    /**
     * Create a new Razorpay subscription.
     *
     * @return \App\Models\Billing\Subscription
     */
    public function update()
    {
        /*$subscription = $this->getRazorpayClient()
            ->subscription
            ->update($this->buildPayload(), $this->subscriptionId);*/
        $subscription = $this->getRazorpayClient()
            ->subscription
            ->fetch($this->subscriptionId);

        $attributes = [
            'name' => $this->name,
            'razorpay_id' => $subscription->id,
            /*'razorpay_plan' => $this->plan,
            'quantity' => $this->quantity,
            'total_count' => $this->total_count,
            'status' => $subscription->status,
            'paid_count' => $subscription->paid_count,
            'auth_attempts' => $subscription->auth_attempts,
            'trial_ends_at' => $this->getStartAtDate(),*/
            'ends_at' => null,
        ];
        //$getSubscription = User::query()->where('razorpay_id', $subscription->customer_id)->first();
        $this->updateSubscription($subscription,$attributes);

    }

    protected function updateSubscription($subscription,array $attributes)
    {
        $relativeUrl = 'subscriptions/' . $subscription->id;

        return $this->request('PATCH', $relativeUrl, $attributes);
    }

    /**
     * Get the Razorpay customer instance for the current user and token.
     *
     * @param  array  $options
     *
     * @return \Razorpay\Customer
     */
    protected function getRazorpayCustomer(array $options = [])
    {
        if (!$this->owner->razorpay_id) {
            $customer = $this->owner->createAsRazorpayCustomer($options);
        } else {
            $customer = $this->owner->asRazorpayCustomer();
        }

        return $customer;
    }

    /**
     * Build the payload for subscription creation.
     *
     * @return array
     */
    protected function buildPayload()
    {
        return array_filter([
            'plan_id' => $this->plan,
            'customer_notify' => $this->customer_notify,
            'quantity' => $this->quantity,
            'start_at' => $this->getTrialEndForPayload(),
            'notes' => $this->notes,
        ]);
    }

    /**
     * Get the trial ending date for the Razorpay payload.
     *
     * @return int|null
     */
    protected function getTrialEndForPayload()
    {
        if ($this->skipTrial) {
            return;
        }

        if ($this->trialExpires) {
            return $this->trialExpires->getTimestamp();
        }
    }

    /*
     * Get the tax percentage for the Razorpay payload.
     *
     * @return int|null
     */
    // protected function getTaxPercentageForPayload()
    // {
    //     if ($taxPercentage = $this->owner->taxPercentage()) {
    //         return $taxPercentage;
    //     }
    // }
}
