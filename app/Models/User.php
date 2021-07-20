<?php

namespace App\Models;

use App\Traits\Billing\Billable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function createCustomer()
    {
        $data = [
            'name' => 'viswa',
            'email' => 'vedukct@gmail.com',
            'contact' => '9894155800',
            'fail_existing' => '0',
            'notes' => [
                'notes_key_1' => 'note 1',
                'notes_key_2' => 'note 2',
            ]
        ];
        $this->createAsRazorpayCustomer($data);
    }

    /*public function createNewSubscription($plan)
   {
       return $this->newSubscription('default', $plan);
   }

   /*pic function getSubscription()
   {
       return $this->subscriptions()->first();
   }*/
}
