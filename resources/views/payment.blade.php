@extends('layouts.app')

@section('content')
    <div id="main-content">
        <div class="container clear">
            <form method="POST">

                @csrf

                <script src="https://checkout.razorpay.com/v1/checkout.js"

                        data-key="{{ env('RAZORPAY_KEY') }}"

                        data-subscription_id = 'sub_HVaMtOkuDG5zLl'

                        data-amount="10000"

                        data-buttontext="Pay 10 INR"

                        data-name="ItSolutionStuff.com"

                        data-description="Rozerpay"

                        data-image="https://www.itsolutionstuff.com/frontTheme/images/logo.png"

                        data-prefill.name="name"

                        data-prefill.email="email"

                        data-theme.color="#ff7529">

                </script>

            </form>
            @endsection

            @section('page-js')

                {{--<script src="{{ '/js/page_js/razorpay/subscription_payment.js' }}"></script>--}}
@endsection
