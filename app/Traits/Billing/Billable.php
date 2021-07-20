<?php

namespace App\Traits\Billing;

use App\Http\Controllers\Billing\SubscriptionBuilder;
use App\Http\Controllers\Billing\SubscriptionUpdateBuilder;
use App\Models\Billing\Subscription;
use Carbon\Carbon;
use Exception;

trait Billable
{
    protected function getRazorpayClient()
    {
        return resolve('razorpay');
    }

    public function scopeByRazorpayId($query, $razorpay_id)
    {
        return $query->where('razorpay_id', $razorpay_id);
    }

    /**
     * Refund a customer for a payment.
     *
     * @param  string  $id
     * @param  array  $refundAmount
     *
     * @return \Razorpay\Api\Refund
     * @throws \InvalidArgumentException
     *
     */
    public function refund($id, $refundAmount = null)
    {
        if (is_null($refundAmount)) {
            return $this->getRazorpayClient()->refund->create(['payment_id' => $id]); // Creates refund for a payment
        }

        return $this->getRazorpayClient()->refund->create([
            'payment_id' => $id, 'amount' => $refundAmount
        ]); // Creates partial refund for a payment
    }

    /**
     * get full payment details by id.
     *
     * @param  string  $id
     *
     * @return \Razorpay\Api\Payment
     *
     */
    public function paymentDetails($id)
    {
        if (is_null($id)) {
            return false;
        }

        return $this->getRazorpayClient()->payment->fetch($id); // get payment
    }

    /**
     * Begin creating a new subscription.
     *
     * @param  string  $subscription
     * @param  string  $plan
     *
     * @return SubscriptionBuilder
     */
    public function newSubscription($subscription, $plan)
    {
        return new SubscriptionBuilder($this, $subscription, $plan);
    }

    /**
     * Begin creating a new subscription.
     *
     * @param  string  $subscription
     * @param  string  $plan
     *
     * @return SubscriptionUpdateBuilder
     */
    public function updateSubscription($attributes = [])
    {
        return new SubscriptionUpdateBuilder($this, $attributes);
    }

    /**
     * Determine if the Razorpay model is on trial.
     *
     * @param  string  $subscription
     * @param  string|null  $plan
     *
     * @return bool
     */
    public function onTrial($subscription = 'default', $plan = null)
    {
        if (func_num_args() === 0 && $this->onGenericTrial()) {
            return true;
        }

        $subscription = $this->subscription($subscription);

        if (is_null($plan)) {
            return $subscription && $subscription->onTrial();
        }

        return $subscription && $subscription->onTrial() &&
            $subscription->razorpay_plan === $plan;
    }

    /**
     * Determine if the Razorpay model is on a "generic" trial at the model level.
     *
     * @return bool
     */
    public function onGenericTrial()
    {
        return $this->trial_ends_at && Carbon::now()->lt($this->trial_ends_at);
    }

    /**
     * Determine if the Razorpay model has a given subscription.
     *
     * @param  string  $subscription
     * @param  string|null  $plan
     *
     * @return bool
     */
    public function subscribed($subscription = 'default', $plan = null)
    {
        $subscription = $this->subscription($subscription);

        if (is_null($subscription)) {
            return false;
        }

        if (is_null($plan)) {
            return $subscription->valid();
        }

        return $subscription->valid() &&
            $subscription->razorpay_plan === $plan;
    }

    /**
     * Determine if the Razorpay model has a given subscription whose billing cycle is started.
     *
     * @param  string  $subscription
     * @param  string|null  $plan
     *
     * @return bool
     */
    public function subscribedWithinBillingCycle($subscription = 'default', $plan = null)
    {
        $subscription = $this->subscriptionWithinBillingCycle($subscription);

        if (is_null($subscription)) {
            return false;
        }

        if (is_null($plan)) {
            return $subscription->isUnderBillingCycle();
        }

        return $subscription->isUnderBillingCycle() &&
            $subscription->razorpay_plan === $plan;
    }

    /**
     * Get a subscription instance by name.
     *
     * @param  string  $subscription
     * @param  string  $include  |all|valid
     *
     * @return \App\Models\Billing\Subscription|null
     */
    public function subscription($subscription = 'default', $include = 'valid')
    {
        $filtered = $this->subscriptions->filter(function ($subscription, $key) use ($include) {
            return ($include == 'valid' && $subscription->hasValidStatus()) || $include != 'valid';
        });

        return $filtered->sortByDesc(function ($value) {
            return $value->created_at->getTimestamp();
        })
            ->first(function ($value) use ($subscription) {
                return $value->name === $subscription;
            });
    }

    /**
     * Get a subscription instance by name and whose billing has started i.e. without trial.
     *
     * @param  string  $subscription
     * @param  string  $include  |all|valid
     *
     * @return \App\Models\Billing\Subscription|null
     */
    public function subscriptionWithinBillingCycle($subscription = 'default')
    {
        $filtered = $this->subscriptions->filter(function ($subscription, $key) {
            return !$subscription->onTrial() && $subscription->isUnderBillingCycle();
        });

        return $filtered->sortByDesc(function ($value) {
            return $value->created_at->getTimestamp();
        })
            ->first(function ($value) use ($subscription) {
                return $value->name === $subscription;
            });
    }

    /**
     * Get all of the subscriptions for the Razorpay model.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, $this->getForeignKey())->orderBy('created_at', 'desc');
    }

    /**
     * Invoice the billable entity outside of regular billing cycle.
     *
     * @return \Razorpay\Api\Invoice
     */
    public function invoice(array $params)
    {
        if ($this->razorpay_id) {
            try {
                $params['customer_id'] = $this->razorpay_id;

                return $this->getRazorpayClient()->invoice->create($params)->issue(); // Ref: razorpay.com/docs/invoices for request params example
            } catch (Exception $e) {
                return false;
            }
        }

        return true;
    }

    /**
     * Invoice fetch by id.
     *
     * @param  string  $id
     *
     * @return \Razorpay\Api\Invoice
     *
     */
    public function invoiceData($id)
    {
        return $this->getRazorpayClient()->invoice->fetch($id); // get invoice
    }

    /**
     * Determine if the Razorpay model is actively subscribed to one of the given plans.
     *
     * @param  array|string  $plans
     * @param  string  $subscription
     *
     * @return bool
     */
    public function subscribedToPlan($plans, $subscription = 'default')
    {
        $subscription = $this->subscription($subscription);

        if (!$subscription || !$subscription->valid()) {
            return false;
        }

        foreach ((array) $plans as $plan) {
            if ($subscription->razorpay_plan === $plan) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if the entity is on the given plan.
     *
     * @param  string  $plan
     *
     * @return bool
     */
    public function onPlan($plan)
    {
        return !is_null($this->subscriptions->first(function ($value) use ($plan) {
            return $value->razorpay_plan === $plan && $value->valid();
        }));
    }

    /**
     * Determine if the entity has a Razorpay customer ID.
     *
     * @return bool
     */
    public function hasRazorpayId()
    {
        return !is_null($this->razorpay_id);
    }

    /**
     * Create a Razorpay customer for the given Razorpay model.
     *
     * @param  string  $token
     * @param  array  $options
     *
     * @return \Razorpay\Customer
     */
    public function createAsRazorpayCustomer(array $options = [])
    {
        $customerFields = ['name' => '', 'email' => '', 'contact' => '', 'fail_existing' => 1];

        $options = array_key_exists('email', $options)
            ? $options : array_merge($options, ['email' => $this->email]);

        $options = array_key_exists('contact', $options)
            ? $options : array_merge($options, ['contact' => $this->mobile_no]);

        $options = array_key_exists('name', $options)
            ? $options : array_merge($options, ['name' => $this->full_name]);

        $options = array_key_exists('fail_existing', $options)
            ? $options : array_merge($options, ['fail_existing' => 1]);

        $options = array_key_exists('notes', $options)
            ? $options : array_merge($options, ['notes' => array_except($options, $customerFields)]);

        $newArray = [];
        foreach ($options as $key => $value) {
            if (array_key_exists($key, $customerFields)) {
                $newArray[$key] = $value;
            }
        }
        $options = $newArray;
        //$options = array_only($options, $customerFields);

        // Here we will create the customer instance on Razorpay and store the ID of the
        // user from Razorpay. This ID will correspond with the Razorpay user instances
        // and allow us to retrieve users from Razorpay later when we need to work.
        $customer = $this->getRazorpayClient()->customer->create(
            $options
        );

        $this->razorpay_id = $customer->id;

        $this->save();

        return $customer;
    }

    public function payment_links(array $options = []){
        $payment = $this->getRazorpayClient()->payment->create(
            $options
        );
        return $this->razorpay_id = $payment->id;
    }

    /**
     * Get the Razorpay customer for the Razorpay model.
     *
     * @return \Razorpay\Customer
     */
    public function asRazorpayCustomer()
    {
        return $this->getRazorpayClient()->customer->fetch(
            $this->razorpay_id
        );
    }

    /**
     * Get the Razorpay supported currency used by the entity.
     *
     * @return string
     */
    public function preferredCurrency()
    {
        return Cashier::usesCurrency();
    }

    /**
     * Get the tax percentage to apply to the subscription.
     *
     * @return int
     */
    public function taxPercentage()
    {
        return 0;
    }
}
