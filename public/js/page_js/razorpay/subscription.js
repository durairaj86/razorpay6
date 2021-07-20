$(function () {
    $('#pay-now').off('click').on('click', function () {
        let plan = $("input[name='plan_id']:checked").val();
        if (plan) {
            loader();
            backgroundPostData('billing/subscription/create', {plan: plan}, callPaymentOption);
            /*$.ajax({
                method: 'post',
                url: 'create',
                dataType: 'json',
                data: {
                    "_token": $("input[name='_token']").val(),
                    "plan": plan
                },
                complete: function (r) {
                    $("#payment_status").html(r.responseText);
                    //console.log('complete');
                    //console.log(r);
                    callPaymentOption(r.responseText);
                }
            })*/
        } else {
            alert("choose any one plan");
        }
    })
})

function callPaymentOption(response) {
    var options = {
        "key": "rzp_test_KEoYxtaoT6ZGUh",
        "subscription_id": response.subscription,
        "name": response.plan.name,
        "description": response.plan.description,
        "image": "/your_logo.png",
        "handler": successHandler,
        "prefill": {
            "name": "Viswa Durai",
            "email": "viswadurai1@gmail.com",
            "contact": "+919894155800"
        },
        "notes": {
            "note_key_1": "Tea. Earl Grey. Hot",
            "note_key_2": "Make it so."
        },
        "theme": {
            "color": "#F37254"
        }
    };
    let rzp1 = new Razorpay(options);
    failureTransaction(rzp1);
    rzp1.open();

    function successHandler(response) {
        backgroundPostData('billing/subscription/authenticated', {
            payment_id: response.razorpay_payment_id,
            subscription_id: response.razorpay_subscription_id,
            signature: response.razorpay_signature
        }, successTransaction, {payment_id: response.razorpay_payment_id});
        /*alert(response.razorpay_payment_id),
            alert(response.razorpay_subscription_id),
            alert(response.razorpay_signature);*/
        /* $.ajax({
             method: 'post',
             url: "{!!route('paystatus')!!}",
             data: {
                 "_token": "{{ csrf_token() }}",
                 "payment_id": response.razorpay_payment_id,
                 "subscription_id": response.razorpay_subscription_id,
                 "signature": response.razorpay_signature
             },
             complete: function (r) {
                 $("#payment_status").html(r.responseText);
                 console.log('complete');
                 console.log(r);
             }
         })*/
    }

    function successTransaction(res, data) {
        location.href = "/billing/subscription/" + data.payment_id + "/success";
    }

    function failureTransaction(rzp1) {
        rzp1.on('payment.failed', function (response) {
            console.log(response.error);
            /*alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);*/
        });
    }

    function checkPayment() {
        $.ajax({
            method: 'post',
            url: "{!!route('paymentCheck')!!}",
            data: {
                "_token": "{{ csrf_token() }}",
                "payment_id": response.razorpay_payment_id
            },
            complete: function (r) {
                $("#payment_status").html(r.responseText);
                console.log('complete');
                console.log(r);
            }
        })
    }

    function paymentInvoice(subscription = false) {
        backgroundPostData('billing/subscription/invoice', {subscription: subscription});
    }

}



