@extends('layouts.app')

@section('content')
    <div id="payment_status">Status</div>
    <div id="main-content">
        <div class="container clear">
            <div class="panel-body" style="border: 1px solid #ddd;padding: 10px;">
                <form id="form">
                    <div class="row">
                        @foreach($plans as $key => $plan)
                            <div class="col-xl-3 col-md-4 col-sm-6">{{ $plan->name }}
                                <div class="form-group bg-info m-4">
                                    <br/>
                                    <p><br/>Price: {{ $plan->amount }} INR </p>
                                    <input type="radio" value="{{ $plan->plan_id }}" id="plan{{ $loop->index }}"
                                           name="plan_id">
                                </div>
                            </div>
                        @endforeach
                    </div>
                    <div class="pay">
                        <button class="razorpay-payment-button btn btn-primary" id="pay-now" type="button">
                            Make
                            Subscription
                        </button>
                        <div class="d-none" id="loading">Loading...</div>
                    </div>

                    {{--<a href="https://amzn.to/2RlZQXk">
                        <img src="https://images-na.ssl-images-amazon.com/images/I/31tPpWGQWzL.jpg"/>
                    </a>
                    <br/>
                    <p><br/>Price: 100 INR </p>
                    <input type="text" id="plan_id" value="plan_HPzcOBiXZMF6Fo">
                    <input type="hidden" name="amount" id="amount" value="100"/>
                    <div class="pay">
                        <button class="razorpay-payment-button btn filled small" id="paybtn" type="button">Make
                            Subscription
                        </button>
                    </div>--}}

                </form>
                <br/><br/>
                <div id="paymentDetail" style="display: none">
                    <center>
                        <div>paymentID: <span id="paymentID"></span></div>
                        <div>paymentDate: <span id="paymentDate"></span></div>
                    </center>
                </div>
            </div>

        </div>
    </div>
    {{--<button id="rzp-button1">Pay</button>--}}

@endsection

@section('page-js')
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script src="{{ '/js/page_js/razorpay/subscription.js' }}"></script>
@endsection
