/* Reminder Fn */
let calendar;

/*common for FI and Settings*/
function customInvoice() {
    let form = $("#invoice-print-form"),
        printColumns = $("#PrintCol").val(),
        tableColumns = $("#tableCol").val(),
        columnIds = $('#print-columns .print-col'),
        tableColumnIds = $('#print-columns .print-tbcol');

    $.each(columnIds, function () {
        let cid = $(this).attr('id').split('col_');
        if (jQuery.inArray(cid[1], printColumns) !== -1) {
            $('#' + cid[1]).prop('checked', true);
        } else {
            $(this).addClass('d-none');
        }
    });

    $.each(tableColumnIds, function () {
        let cls = $(this).attr('id').split('tbl_');
        if (jQuery.inArray(cls[1], tableColumns) !== -1) {
            $('#' + cls[1]).prop('checked', true);
        } else {
            $('.' + cls[1]).addClass('d-none');
        }
    });

    $('.custom-control-input').on('click', function () {
        let printCol = $(this).attr('id'),
            type = $(this).data('type');
        if ($(this).is(":checked")) {
            if (type === 'table') {
                $('.' + printCol).removeClass('d-none');
            } else {
                $('#col_' + printCol).removeClass('d-none');
            }
        } else {
            if (type === 'table') {
                $('.' + printCol).addClass('d-none');
            } else {
                $('#col_' + printCol).addClass('d-none');
            }
        }
    });
    return form;
}

/*common for FI and Job*/
function incomeCall() {
    let form = $("#form"),
        url = form.find("#data-url").val();

    datePicker(form);
    formValidation(form);

    $('.revert-income').on('click', function () {
        let voucherNo = $(this).data('voucher'),
            postingDate = $(this).closest('tr').find('.booked-date').text(),
            options = {
                title: "Are you sure to revert Income booking ?",
                text: "Reverse entry will pass on " + postingDate + ". Once done action can't be revert",
                confirmText: 'Yes, Revert entry',
                confirmCallBack: revertIncome

            };

        confirmBox(options, {voucher_no: voucherNo, 'posted_at': postingDate});

        function revertIncome(data) {
            backgroundPostData('job/revert/income', data, revertCallBack, {alert: 'alert'});
        }

        function revertCallBack() {
            processModalBody(url, false, incomeCall, {
                size: 'medium',
                data: '',
                buttons: !0,
                customButtons: false
            });
            $('.modal').last().focus();
        }
    });
    $("#submit").off('click').on('click', function () {// do not remove off click
        if (parseFloat($('#wip-debit').text()) === 0 && parseFloat($('#wip-credit').text()) === 0 && parseFloat($('#wip-balance').text()) === 0) {
            showToastr('Income Zero', 'Income posting not allowed with income zero', 'error');
        } else if (form.valid())
            sendData(url, false, {dataTable: false});
    });
}

/*common for PV and IC*/
function voucherCommonEvents(form, url, callCalculation) {
    let account = form.find('#transaction_account'),
        totalAmount = form.find("#total_amount"),
        type = form.find("#voucher_type");

    type.on('change', function () {
        changeAmountSign();
    });

    account.on('change', function () {
        let acc = $(this).val(),
            totalAmount = $("#total_amount");

        type.prop('disabled', false);
        totalAmount.add(type).prop('disabled', false);
        if (acc === "9019025") {
            totalAmount.prop('disabled', true);
            type.prop('disabled', true).html('<option value="N" data-subtext="Netting Voucher">N</option>');
        } else if (acc.indexOf('90190') > -1) {
            type.html('<option value="BCV" data-subtext="Bank Collection Voucher">BCV</option><option value="BPV" data-subtext="Bank Payment Voucher">BPV</option>');
        } else if (acc.indexOf('90191') > -1) {
            type.html('<option value="CCV" data-subtext="Cash Collection Voucher">CCV</option><option value="CPV" data-subtext="Cash Payment Voucher">CPV</option>');
        }
        type.selectpicker('refresh');
        if (acc === "9019025") {
            type.selectpicker('val', 'N');
        }
        changeAmountSign();
        backgroundPostData(url + acc + '/balance', false, accountBalance);
    });

    if (account.val()) {
        let currentVal = type.data('value');
        account.trigger('change');
        type.selectpicker('val', currentVal);
        changeAmountSign();
    }

    function accountBalance(res) {
        $("#account_balance").text(res.balance);
    }

    function changeAmountSign() {
        let signType = $(".sign_type"),
            type = $('#voucher_type').val(),
            totalAmountValue = setAmount(totalAmount.val()),
            signAmount = 0;

        signType.text('');
        if (isNaN(totalAmountValue))
            totalAmount.val(0);
        if (type === 'BPV' || type === 'CPV') {
            signType.text('(-Credit)');
            signAmount = '-' + Math.abs(totalAmountValue);
            totalAmount.val(signAmount);
        } else if (type === 'BCV' || type === 'CCV') {
            signType.text('(+Debit)');
            signAmount = Math.abs(totalAmountValue);
            totalAmount.val(signAmount);
        } else if (type === 'N') {
            signType.text('(Zero)');
            totalAmount.val(0);
        }
        callCalculation();
    }
}

function viewVoucher() {
    $('.voucher_view').on('click', function () {
        let row = $(this).closest('tr'),
            id = row.data('id'), head, url,
            type = row.data('type'),
            rowNo = row.find('td.row_no span').text();
        if (type) {
            url = 'inter/company/' + id + '/view';
            head = 'Inter Company- ';
        } else {
            url = 'finance/voucher/payment/' + id + '/view';
            head = 'Payment Voucher- ';
        }

        getDataInModal(url, head + rowNo, false, {buttons: false});
    });
}


function dayCalendar() {
    let calendarEl = document.getElementById('floatbar-body'),
        today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'),
        yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    calendarEl.innerHTML = '';
    let dayCalendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid', 'bootstrap', 'timeGrid', 'list', 'googleCalendar', 'interaction'],
        defaultView: 'timeGrid',
        themeSystem: 'bootstrap',
        header: {
            right: 'timeGridDay,list',
            center: 'title',
            left: 'today prev,next'
        },
        titleFormat: {year: 'numeric', month: 'short', day: 'numeric'},
        buttonText: {
            today: 'Today'
        },
        bootstrapFontAwesome: {
            day: "fa-clock",
            list: "fa-list"
        },
        googleCalendarApiKey: 'AIzaSyAeLg77ZMIrOUv3_HDBGmrCKiq-boylS2c',
        eventSources: [
            {
                url: getUrl() + 'reminder/events',
                type: 'GET',
            }
        ],
        dateClick: function (info) {
            let data = {date: info.dateStr, type: '1'};
            if (info.dateStr > today) {
                getDataInFloatBar('reminder/create', 'Reminder Or Document', reminderCall, {
                    size: 'medium',
                    data: data,
                    buttons: true
                });
            }
        },
        eventClick: function (info) {
            let data = {date: '', id: info.event.id, type: '1'};
            let url = 'reminder/' + info.event.id + '/edit';
            if (info.el.innerText.includes('Task')) {
                getDataInFloatBar('task/cards', 'Task', taskCall, {data: {type: '1'}});
            } else {
                getDataInFloatBar(url, 'Reminder Or Document', reminderCall, {
                    size: 'medium',
                    data: data,
                    buttons: true
                });
            }
        },
        viewSkeletonRender: function () {
            $(calendarEl).find('.fc-today-button').addClass('btn-sm');
            $(calendarEl).find('.fc-center').addClass('align-self-start');
            $(calendarEl).find('.fc-right .btn-group,.fc-left .btn-group').addClass('btn-group-sm');
            $(calendarEl).find(".fc-timeGridDay-button").html('<i class="fas fa-clock"></i>');
            $(calendarEl).find('.fc-right').find('button:eq(0)').addClass('active');
        }
    });
    dayCalendar.render();
}

function calenderCall(id) {
    id = (id) ? id : 'calendar';
    let calendarEl = document.getElementById(id),
        today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'),
        yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid', 'bootstrap', 'timeGrid', 'list', 'googleCalendar', 'interaction'],
        themeSystem: 'bootstrap',
        header: {
            right: 'dayGridMonth, timeGridWeek, timeGridDay, listMonth',
            center: 'title',
            left: 'today prev,next'
        },
        buttonText: {
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List'
        },
        googleCalendarApiKey: 'AIzaSyAeLg77ZMIrOUv3_HDBGmrCKiq-boylS2c',
        eventSources: [
            {
                url: getUrl() + 'reminder/events',
                type: 'GET',
            }
        ],
        dateClick: function (info) {
            let data = {date: info.dateStr, type: '0'};
            if (data.date > today) {
                getDataInModal('reminder/create', 'Reminder Or Document', reminderCall, {size: 'medium', data: data});
            }
        },
        eventClick: function (info) {
            let data = {date: '', id: info.event.id, type: '0'},
                url = 'reminder/' + info.event.id + '/edit';
            if (info.el.innerText.includes('Rem')) {
                getDataInModal(url, 'Reminder Or Document', reminderCall, {
                    size: 'medium',
                    data: data,
                    customButtons: '<button id="delete" type="button" class="btn btn-warning">Delete</button>'
                });
            } else if (info.el.innerText.includes('Doc')) {
                getDataInModal(url, 'Reminder Or Document', reminderCall, {
                    size: 'medium',
                    data: data,
                    buttons: false
                });
            } else {
                getDataInModal('task/' + info.event.id + '/edit', __('Task'), taskCall, {
                    size: 'medium',
                    buttons: false
                });
            }
        },
        viewSkeletonRender: function () {
            $(calendarEl).find('.fc-center').addClass('align-self-start');
            $('.fc-right').addClass('btn-group');
        }
    });
    calendar.render();
}

function reminderCall() {
    let form = $('#form');
    let addDocumentCheck = $("#addAsDocument"),
        referenceId = $("#referenceId");

    let commonA = $('.common-a');
    commonA.find('input.reqRem').prop("required", false);

    onBootup(form);
    documentCheck(addDocumentCheck);

    $("#timeDropper").timeDropper({
        borderColor: '#1ab394',
        format: 'hh:mm a',
        meridians: 1,
        autoswitch: 1,
        setCurrentTime: false,
    });

    $('#submit').on('click', function (e) {
        let url = form.find('#data-url').val(),
            success = form.valid(), type = $("#r-type").val();
        if (success) {
            if (type === '1') {
                sendData(url, dayCalendar);
            } else {
                sendData(url, function () {
                    calendar.refetchEvents();
                })
            }
        }
    });

    $('#delete').on('click', function (e) {
        let id = $('#data-id').val(),
            url = id + '/delete';
        confirmBox({
            text: 'This will Delete Reminder',
            confirmCallBack: deleteCallback
        }, '');

        function deleteCallback() {
            sendData(url, function () {
                calendar.refetchEvents();
            });
        }
    });

    /*Delete button for file in edit action*/
    $(".deleteFile").on('click', function (e) {
        let id = $(this).attr('data-id');
        let dId = $('#data-id').val();
        let options = {extras: $(this)};
        deleteData('reminder/' + dId + '/' + id + '/remove', '', fileCount, options);
    });

    function fileCount(options) {
        $('#file').fileinput('destroy');
        if (options) {
            $(options.extras).parent().parent('.files').remove();
        }
    }

    $('#reference').on('change', function () {
        let val = $(this).val();
        referenceId.html('');
        if (val !== '' && val !== 'other') {
            backgroundPostData('reminder/data/' + val, $(this), appendChooser);
        } else {
            referenceId.prop('disabled', true);
            referenceId.prop('required', false);
            referenceId.selectpicker('refresh');
        }
    });

    referenceId.on('change', function () {
        let val = $(this).find('option:selected').attr('data-subtext');
        form.find('#upload_row_no').val(val);
    });

    function appendChooser(data) {
        destroyStickLoader();
        let name;
        referenceId.prop('disabled', false);
        let options = '<option value="">Select</option>';
        $.each(data, function (index, value) {
            name = (data[index].user_name) ? data[index].user_name : data[index].name || value.customer.name;
            options += '<option value="' + data[index].id + '" data-subtext="' + data[index].row_no + '">' + name + '</option>';
        });
        referenceId.html(options);
        referenceId.selectpicker('refresh');
    }

    addDocumentCheck.on('click', function () {
        documentCheck($(this));
    });

    function documentCheck(check) {
        let commonA = $('.common-a'),
            commonB = $('.common-b');
        if (check.is(":checked")) {
            commonA.find('input.reqRem').prop("required", false);
            commonA.addClass('d-none');
            commonB.removeClass('d-none');
            commonB.find('input.reqDoc').prop("required", true);
        } else {
            commonB.find('input.reqDoc').prop("required", false);
            commonB.addClass('d-none');
            commonA.removeClass('d-none');
            commonA.find('input.reqRem').prop("required", true);
        }
    }

}

/* Reminder Fn End */

/* Alert Call Fn */
function alertCall() {

    $('#nav').find('li a').on('click', function () {
        let status = $(this).attr('id');
        getDataInFloatBar('alerts', 'Alerts', alertCall, {data: {'type': status}});
    });

    $('.job-link').on('click', function () {
        let description = $(this).find('div p').text(),
            rowNo = description.split(': ')[1],
            url = getUrl() + 'job/list?rowNo=' + rowNo;
        window.open(url, '_blank');
    });

}

/* Task Call Fn */
function taskCall() {
    let tag = $("#tagVal"),
        form = $("#form");

    onBootup(form);

    tag.selectpicker({
        size: 5,
        liveSearch: true,
    });

    tag.on('change', function () {
        let val = $(this).val();
        if (val.includes("NtagN")) {
            $(this).val('');
            $(this).selectpicker('refresh');
            getDataInModal("task/quick/tag", "Quick Tag", quickTag, {size: 'medium', buttons: false});
        }
    });

    $("#timeDropper").timeDropper({
        borderColor: '#1ab394',
        format: 'hh:mm a',
        meridians: 1,
        autoswitch: 1,
        setCurrentTime: false,
    });

    $('.task-status a').on('click', function () {
        let id = $(this).parent('div.dropdown-menu').data('id');
        backgroundPostData('task/' + id + '/status', {'status': $(this).data('value')}, taskCards, {alert: 'toastr'});
    });

    $('#new-task').on('keydown', function (e) {
        let val = $(this).val();
        if (e.keyCode === 13 || e.keyCode === 9) {
            e.preventDefault();
            backgroundPostData('task/short/create', {'title': val}, taskCards);
            return false;
        }
    });

    $('.task-edit').off('click').on('click', function () {
        let id = $(this).data('id');
        getDataInFloatBar('task/' + id + '/edit', 'Task', taskCall, {buttons: true, data: {'type': '1'}});
    });
    $('.task-delete').off('click').on('click', function () {
        let id = $(this).data('id');
        deleteData('task/' + id + '/delete', 'Task', taskCards);

    });

    $("#submit").on('click', function () {
        let success = form.valid(), type = $("#r-type").val();
        if (success) {
            if (type === '1') {
                sendData(form.attr('action'), taskCards, {dataTable: false});
            } else {
                sendData(form.attr('action'));
            }
        }
    });

    function quickTag() {
        $("#quick_submit").on('click', function (e) {
            console.log('hello');
            e.preventDefault();
            let form = $("#quick_form"),
                success = form.valid();
            if (success)
                sendData(form.attr('action'), appendData, {form: 'quick_form', closeModal: 1});

        });

        function appendData(data) {
            let opt = document.createElement('option');
            opt.setAttribute('value', data.data.id);
            opt.innerHTML = data.data.name;
            let ele = $('#' + data.data.target);
            ele.find('option:first-child').after(opt);
            ele.val(data.data.id);
            ele.selectpicker('refresh');
        }
    }
}

function taskCards() {
    let linkUrl = getUrl() + 'task/list';
    let btns = '<a href="' + linkUrl + '" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm"><i class="ft-external-link"></i> New Tab </button></a>';
    getDataInFloatBar('task/cards', 'Task', taskCall, {linkButtons: btns, data: {type: '1'}});
}

/* Task Call Fn End */

/*Ticket call fn*/
function feedBack() {
    let linkUrl = getUrl() + 'ticket/list';
    let btns = '<a href="' + linkUrl + '" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm"><i class="ft-external-link"></i> New Tab </button></a>';
    getDataInFloatBar('ticket/create', 'Tickets and Ticket', suggestionCall, {
        linkButtons: btns,
        data: {type: '1'},
        buttons: true
    });
}

function suggestionCall() {

    let form = $('#form'),
        /*summer_note*/
        submitUrl = form.find("#data-url").val(),
        description = $("#descriptions");

    onBootup(form);

    description.summernote({
        height: 250,
    });

    /*Delete button for file in edit action*/
    $('.deleteFile').on('click', function () {
        let baseUrl = 'ticket/',
            id = $(this).attr('data-id'),
            sId = $('#data-id').val(),
            options = {extras: $(this)};
        deleteData(baseUrl + sId + '/' + id + '/remove', '', fileCounts, options);
    });

    $('#status_entry').on('change', function () {
        if ($('#status_entry').val() == 3) {
            $('#check_data').removeClass('d-none');
        } else {
            $('#check_data').addClass('d-none');
        }
    });

    $("#submit").on('click', function () {
        let type = $("#r-type").val();
        if (form.valid()) {
            if (type === '1') {
                sendData(submitUrl, feedBack, {dataTable: false});
            } else {
                sendData(submitUrl);
            }
        }
    });

    /*Delete file from edit action*/
    function fileCounts(options) {
        $('#file').fileinput('destroy');
        if (options)
            $(options.extras).parent().parent().remove();
    }
}

/* Ticket Call Fn End */

/*Document call fn*/
function documents() {
    let linkUrl = getUrl() + 'document/list';
    let btns = '<a href="' + linkUrl + '" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm"><i class="ft-external-link"></i> New Tab </button></a>';
    getDataInFloatBar('document/create', 'Document', documentCall, {
        linkButtons: btns,
        data: {type: '1'},
        buttons: true
    });
}

function documentCall() {

    let form = $('#form'),
        selectPicker = $('.selectpicker');

    onBootup(form);
    dateConstrain();

    $('#reference').on('change', function () {
        let val = $(this).val(),
            customerSupplierSelect = form.find('#customer_supplier');
        customerSupplierSelect.html('');
        if (val !== '' && val !== 'other') {
            stickLoader('Chooser', 'Successfully Get the name');
            customerSupplierSelect.prop('disabled', false);
            backgroundPostData('document/data/' + val, $(this), appendChooser);
        } else {
            customerSupplierSelect.prop('disabled', false);
            customerSupplierSelect.prop('required', false);
            selectPicker.selectpicker('refresh');
        }
    });

    $('#customer_supplier').on('change', function () {
        let val = $(this).find('option:selected').attr('data-subtext');
        form.find('#upload_row_no').val(val);
    });

    function appendChooser(data) {
        destroyStickLoader();
        let customerSupplierSelect = form.find('#customer_supplier');
        customerSupplierSelect.append($('<option>', {
            value: '',
            text: 'Select'
        }));
        $.each(data, function (index, value) {
            let name = (data[index].user_name) ? data[index].user_name : data[index].name || value.customer.name,
                active = data[index].deleted_at != null ? false : true;
            customerSupplierSelect.append($('<option>', {
                value: data[index].id,
                text: data[index].row_no,
                'data-subtext': name,
                'data-active': active
            }));
        });
        selectPicker.selectpicker('refresh');
    }

    /*Delete button for file in edit action*/
    $('.deleteFile').on('click', function (e) {
        let baseUrl = 'document/',
            id = $(this).attr('data-id'),
            dId = $('#data-id').val(),
            options = {extras: $(this)};
        deleteData(baseUrl + dId + '/' + id + '/remove', 'Are you sure want to delete document?', fileCounts, options);
    });

    $("#submit").on('click', function () {
        let success = form.valid(),
            type = $("#r-type").val(),
            referenceVal = $("select#reference").find('option:selected').val(),
            active = $("select#customer_supplier").find('option:selected').data('active');
        if (success)
            if (type === '1') {
                sendData(form.attr('action'), documents, {dataTable: false});
            } else if (active || referenceVal != 'employee') {
                sendData(form.attr('action'));
            } else {
                showToastr('Employee', 'You cannot edit document for a terminated or deleted employee', {type: 'error'})
            }
    });

    /*Delete file from edit action*/
    function fileCounts(options) {
        $('#file').fileinput('destroy');
        if (options)
            $(options.extras).parent().parent().remove();
    }
}

/* customer call */
function customerCall() {
    let formId = $("#form"),
        salesDetails = $('#sales'),
        loginDetails = $('#tracking'),
        password = $('#password');
    tabChange();
    onBootup();
    setTypeahead();
    changeCustomerGstTreatment($("#gst-treatment").val(), $("#gst-no"), $("#state"));
    nameOtherKeyEvent($('#name'), $('#display-name'));
    if (loginDetails.find('#checkbox').prop('checked') === true) {
        password.closest('td').removeClass('hide');
        password.removeAttr('disabled');
    }

    if (salesDetails.find('#credit-period').val() === 'custom') {
        let creditPeriod = salesDetails.find('input#credit-period-custom');
        creditPeriod.addClass('required');
        creditPeriod.parent().removeClass('d-none');
    }
    salesDetails.find('#credit-period').on('change', function () {
        let creditPeriod = salesDetails.find('input#credit-period-custom');
        creditPeriod.val('');
        if ($(this).val() === 'custom') {
            creditPeriod.addClass('required');
            creditPeriod.parent().removeClass('d-none');
        } else {
            creditPeriod.parent().addClass('d-none');
            creditPeriod.removeClass('required');
        }
    });

    formId.find('#gst-no').on('focusout', function () {
        customerStateChange($(this), formId);

    });

    formId.find("#gst-treatment").on('change', function () {
        changeCustomerGstTreatment($(this).val(), $("#gst-no"), $("#state"));
    })

    formId.find("#currency").on('change', function () {
        let rate = $(this).find('option:selected').data('rate');
        $("#currency-rate").val(rate);
    })

    formId.find('.delete_gst_doc').on('click', function (e) {
        e.preventDefault();
        let id = formId.find('#data-id').val();
        deleteData('customer/' + id + '/deleteGstDoc', 'Delete Gst Document ?', deleteDoc, {
            element: $(this)
        });
    });
    formId.find('.delete_doc').on('click', function (e) {
        e.preventDefault();
        let id = $(this).closest('.document-row').find('.invisible_document').val();
        deleteData('customer/' + id + '/deleteDoc', 'Delete Document ?', deleteDoc, {
            element: $(this)
        });
    });
    formId.find('.delete-bank-doc').on('click', function (e) {
        let id = $(this).data('id');
        deleteData('customer/bank/' + id + '/deleteDoc', 'Bank Document will be deleted', deleteDoc, {
            data: {
                model: 'customer_banks',
            }, element: $(this)
        });
    });

    function deleteDoc(data) {
        data.element.siblings('a').remove();
        data.element.remove();
    }

    /******communication details start*****/

    /* button click(add)->contact */

    let communicationTbody = $("#communication-body"),
        contactRow = $('#contact-row');

    $("#add-contact").on('click', function () {
        addContact();
    });

    /*edit and remove communication*/
    communicationTbody.find('button.db-remove-contact').off('click').on('click', function () {
        let div = $(this).closest('.contact-row');
        deleteData('customer/' + $(this).attr('data-compose'), div.find('div .form-control').val() + ' will be deleted', removeRow, div);
    });

    /*this function was when they contact (add) button -> dynamically add */
    function addContact(tabRow) {
        let newDiv = contactRow.clone();
        newDiv.removeAttr('id');
        newDiv.find(":input").val('');
        newDiv.find('.email').text('Email');
        newDiv.find('.bootstrap-select').each(function () {
            $(this).find('button,div,option.bs-title-option').remove();
            let h = $(this).html();
            $(this).closest('div').html(h);
        });
        newDiv.after('td:last').append('<td><button type="button" name="" class="contact-remove btn btn-default btn-sm btn-round remove float-right" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></td>');
        /* if tab or enter key pressed*/
        if (tabRow) {
            if (!tabRow.next('tr.contact-row').length) {

                communicationTbody.find(tabRow).after(newDiv);
            }
        } else {
            communicationTbody.find('.contact-row').last().after(newDiv);
        }
        bindContactEvents();
        onRowBootup(newDiv);
    }

    bindContactEvents();

    /*this was removing dynamically add row*/
    function bindContactEvents() {
        communicationTbody.find("button.contact-remove").off('click').on('click', function () {
            removeRow($(this).closest('.contact-row'));
        });
        /*tab and enter key pressed in website field.*/
        communicationTbody.find('input.mobile').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {
                addContact($(this).closest('.contact-row'));
            }
        });
    }

    /******communication details end*****/

    /****** shipping details start*****/
    let shippingTbody = $("#shipping-body"),
        shippingRow = $('#shipping-row');

    $("#add-shipping").on('click', function () {
        addShipping();
    });

    function addShipping(tabRow) {
        let newDiv = shippingRow.clone();
        newDiv.removeAttr('id');
        newDiv.find(":input").val('');
        newDiv.find('.bootstrap-select').each(function () {
            $(this).find('button,div,option.bs-title-option').remove();
            $(this).find("option").removeAttr('selected');
            let h = $(this).html();
            $(this).closest('div').html(h);
        });
        newDiv.after('div:last').children().append('<div class="col"><button type="button" name="" class="shipping-remove btn btn-default btn-sm btn-round remove float-right mt-3" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></div>');

        /* if tab or enter key pressed*/
        if (tabRow) {
            if (!tabRow.next('div.shipping-row').length) {

                shippingTbody.find(tabRow).after(newDiv);
            }
        } else {
            shippingTbody.find('.shipping-row').last().after(newDiv);
        }
        bindShippingEvents();
        onRowBootup(newDiv);
    }

    bindShippingEvents();

    function bindShippingEvents() {
        shippingTbody.find("button.shipping-remove").off('click').on('click', function () {
            removeRow($(this).closest('.shipping-row'));
        });
    }

    /*edit and remove shipping*/
    shippingTbody.find('button.db-remove-shipping').off('click').on('click', function () {
        let div = $(this).closest('.shipping-row');
        deleteData('customer/' + $(this).attr('data-compose'), 'This address will be deleted', removeRow, div);
    });

    /******document details start*****/
    let documentTbody = $("#document-body"),
        documentRow = $('#document-row');

    $("#add-document").on('click', function () {
        addDocument();
    });
    documentName();

    function addDocument() {
        let newDiv = documentRow.clone();
        newDiv.removeAttr('id');
        newDiv.find('input').prop('disabled', false).val('');
        newDiv.find('div.file-input').remove();
        newDiv.find('button.view').remove();
        newDiv.find('button.delete_doc').remove();
        newDiv.find('div.document').prepend('<input type="file" name="document" class="form-control document">');
        newDiv.after('div:last').children().append('<div class=""><button type="button" name="" class="document-remove btn btn-default btn-sm btn-round remove float-right mt-3" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></div>');
        documentTbody.find('.document-row').last().after(newDiv);
        documentTbody = $("#document-body");
        bindDocumentEvents();
        fileInput(newDiv);
        datePicker(newDiv);
        documentName();
    }

    bindDocumentEvents();

    function bindDocumentEvents() {
        documentTbody.find("button.document-remove").off('click').on('click', function () {
            removeDocumentRow($(this).closest('.document-row'));
        });
    }

    function removeDocumentRow(div) {
        div.remove();
        documentName();
    }

    function documentName() {
        let k = 0;
        documentTbody.find('input.document').each(function (k) {
            $(this).attr('name', 'document' + k);
            k++;
        });
    }

    /*edit and remove Document*/
    documentTbody.find('button.db-remove-doc').off('click').on('click', function () {
        let div = $(this).closest('.document-row');
        deleteData('customer/' + $(this).attr('data-compose'), div.find('div .form-control').val() + ' will be deleted', removeRow, div);
    });


    /******document details end*****/

    /******bank details start*****/
    /*button click(add)->account*/

    let bankTbody = $("#bank-body"),
        accountRow = $('#account-row');

    $("#add-account").on('click', function () {
        addAccount();
    });
    /*edit and remove bank details*/
    bankTbody.find('button.db-remove-bank').off('click').on('click', function () {
        let div = $(this).closest('.account-row');
        deleteData('customer/' + $(this).attr('data-compose'), 'Customer Bank Data will be deleted', removeRow, div);
    });

    /* this function call when they account (add) button->dynamically add */
    function addAccount(tabRow) {
        let newDiv = accountRow.clone();
        newDiv.removeAttr('id');
        newDiv.find('input').prop('disabled', false).val('');
        newDiv.find('input.numeric').val(0);
        newDiv.find('div.file-input').remove();
        newDiv.find('.bootstrap-select').remove();
        newDiv.find('div.account-type').prepend(' <select   class="form-control selectpicker" name="account_type[]"><option selected value="0">Savings</option><option  value="1">Current</option></select>');
        newDiv.find('button.view').remove();
        newDiv.find('button.delete-bank-doc').remove();
        newDiv.find('div.bank-document').prepend('<input type="file" name="bank_document[]" class="form-control bank-document">');
        newDiv.find('a').remove();
        newDiv.after('div:last').children().append('<div class="col-xl-4 col-lg-4 col-md-12"><button type="button" name="" class="bank-remove btn btn-default btn-sm btn-round remove float-right mt-3" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></div>');
        if (tabRow) {
            if (!tabRow.next('div.account-row').length) {
                bankTbody.find(tabRow).after(newDiv);
            }
        } else {
            bankTbody.find('.account-row').last().after(newDiv);
        }
        bankDocumentName(bankTbody);
        bindBankEvents();
        onRowBootup(newDiv);
    }

    bindBankEvents();

    /*this was removing dynamically add row*/
    function bindBankEvents() {
        bankTbody.find("button.bank-remove").off('click').on('click', function () {
            removeRow($(this).closest('.account-row'));
        });

        /* if tab or enter key pressed*/
        bankTbody.find('input.bank-address').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {
                addAccount($(this).closest('.account-row'));
            }
        });
    }

    /******bank details end*****/

    /******login details start*****/
    password.attr('disabled', true);
    loginDetails.find('#custom').on('click', function () {
        if ($(this).is(':checked')) {
            let password = $('#password');
            password.removeAttr('disabled');
            password.removeClass('disabled');
        } else {
            password.attr('disabled', true);
        }
        if ($(this).is(':checked'))
            password.attr('required', true);
        else
            password.attr('required', false);

    });
    loginDetails.find('#enable').on('click', function () {
        $('.tracking').toggleClass('hide');
    });

    /******login details end*****/

    function removeRow(div) {
        div.remove();
        bankDocumentName(bankTbody);
    }

    $("#submit").on("click", function (e) {
        let valid = $('#form').valid(),
            check = false,
            creditPeriod = $('#credit-period'),
            creditLimit = $('#credit-limit');
        let period = creditPeriod.val();
        let limit = parseFloat(creditLimit.val());
        if ((period === '' && limit === 0) || (period !== '' && limit > 0)) {
            check = true;
        }
        if (valid) {
            if (check)
                sendData($('#data-url').val(), false);
            else {
                showToastr('Error', 'Please check credit period and credit limit', 'error');
            }
        }
    });
}


function nameOtherKeyEvent(name, nameOther) {
    /* let nameOther = $('#name-other'),
    name = $('#name');*/
    let val = nameOther.val();
    name.on('keyup', function () {
        let data = nameOther.attr('data-value');
        if (val === '' && data === 'false') {
            nameOther.val(name.val());
        }
    });
    nameOther.on('keyup', function () {
        $(this).attr('data-value', true);
        if ($(this).val() === '') {
            $(this).attr('data-value', false);
        }
    });
}

function bankDocumentName(bankTbody) {
    let k = 0;
    bankTbody.find('input.bank-document').each(function (k) {
        $(this).attr('name', 'bank_document' + k);
        k++;
    });
}

/* Supplier Call */
function supplierCall() {
    tabChange();
    onBootup();
    setTypeahead();
    nameOtherKeyEvent($('#name'), $('#display-name'));
    nameOtherKeyEvent($('#b-address-1'), $('#b-address-2'));
    /*    */

    /*    */
    let form = $('#form');
    form.find('#gst-no').on('focusout', function () {
        let gstNo = $(this).val();
        let stateCode = gstNo.slice(0, 2);
        if (statesMethod(stateCode, true)) {
            form.find('#state').val(stateCode).selectpicker('refresh');
        }

    });


    form.find('#gst-treatment').on('change', function () {
        let treatmentVal = $(this).find('option:selected').val();
        supplierTreatmentChange(treatmentVal, form)
    });

    /*start Supplier Shipping adress*/
    let shippingRow = $('#shipping-row'), addressBody = $('#contact');
    $("#add-shipping").on('click', function () {
        addShipping();
    });
    addressBody.find('button.db-remove-shipping').off('click').on('click', function () {
        let div = $(this).closest('.shipping-row');
        deleteData('supplier/' + $(this).attr('data-compose'), 'Supplier Shipping address will be deleted', removeRow, div);
    });

    function addShipping(tabRow) {
        let newDiv = shippingRow.clone();
        newDiv.removeAttr('id');
        newDiv.find('input').prop('disabled', false).val('');
        newDiv.find('textarea').prop('disabled', false).val('');
        newDiv.find('input.numeric').val(0);
        newDiv.find('input.shipping-type').val('1');
        newDiv.find('.bootstrap-select').each(function () {
            $(this).find('button,div,option.bs-title-option').remove();
            $(this).find('option').removeAttr('selected');
            let h = $(this).html();
            $(this).closest('div').html(h);
        });
        newDiv.after('div:last').children().append('<div class="col float-right"><button type="button" name="" class="shipping-remove btn btn-default btn-sm btn-round remove float-right mt-3" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></div>');
        if (tabRow) {
            if (!tabRow.next('div.shipping-row').length) {
                addressBody.find(tabRow).last().after(newDiv);
            }
        } else {
            addressBody.find('.shipping-row').last().after(newDiv)
        }
        onRowBootup(newDiv);
        bindShippingEvents()
    }

    bindShippingEvents();

    function bindShippingEvents() {
        addressBody.find('.remove').on('click', function () {
            removeRow($(this).closest('.shipping-row'));
        });
        addressBody.find('input.l-fax:last').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {
                addShipping($(this).closest('.shipping-row'));

            }
        });
    }

    /*shipping address functions end */

    let communicationDetails = $("#communication"),
        bankDetails = $("#bank");


    /******communication details start*****/

    /* button click(add)->contact */
    let communicationTbody = $("#communication-body"),
        contactRow = $('#communication-row');
    $("#add-communication").on('click', function () {
        addCommunication();
    });
    /*edit and remove communication*/
    communicationTbody.find('button.db-remove-communication').off('click').on('click', function () {
        let div = $(this).closest('.communication-row');
        deleteData('supplier/' + $(this).attr('data-compose'), div.find('input.email').val() + ' will be deleted', removeRow, div);
    });


    /*this function was when they contact (add) button -> dynamically add */
    function addCommunication(tabRow) {
        let newDiv = contactRow.clone();
        newDiv.removeAttr('id');
        newDiv.find(":input").val('');
        newDiv.find('.email').text('Email');
        newDiv.find('.bootstrap-select').each(function () {
            $(this).find('button,div,option.bs-title-option').remove();
            let h = $(this).html();
            $(this).closest('div').html(h);
        });
        newDiv.find('td:last ').append('<button type="button" name="" class="communication-remove float-right mt-1 btn btn-default btn-sm btn-round remove" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button>');
        if (tabRow) {
            if (!tabRow.next('tr.communication-row').length) {

                communicationTbody.find(tabRow).after(newDiv);
            }
        } else {
            communicationTbody.find('.communication-row').last().after(newDiv);
        }
        bindCommunicationEvents();
        onRowBootup(newDiv);
    }

    bindCommunicationEvents();

    function bindCommunicationEvents() {
        communicationTbody.find('.remove').off('click').on('click', function () {
            removeRow($(this).closest('.communication-row'));
        });
        /*tab and enter key pressed in website field.*/
        communicationTbody.find('input.mobile:last').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {

                addCommunication($(this).closest('.communication-row'));
            }
        });
    }

    /******communication details end*****/
    /* end communication events */

    form.find('.db-remove-doc').on('click', function (e) {
        e.preventDefault();
        let docUrl = $(this).data('compose');
        deleteData('supplier/' + docUrl, 'Document will be deleted', deleteDocument, {
            element: $(this)
        });
    });

    form.find('.delete-bank-doc').on('click', function (e) {
        let id = $(this).data('id');
        deleteData('supplier/bank/' + id + '/deleteDoc', 'Bank Document will be deleted', deleteDoc, {
            data: {
                model: 'supplier_bank',
            }, element: $(this)
        });
    });

    function deleteDocument(data) {
        data.element.closest('.supplier-doc').remove();
    }

    function deleteDoc(data) {
        data.element.siblings('a').remove();
        data.element.remove();
    }


    /*this was removing dynamically add row*/


    /******bank details start*****/
    /*button click(add)->account*/
    let bankTbody = $("#bank-body"),
        accountRow = $('#account-row');
    $("#add-account").on('click', function () {
        addAccount();
    });
    bankTbody.find('button.db-remove-bank').off('click').on('click', function () {
        let div = $(this).closest('.account-row');
        deleteData('supplier/' + $(this).attr('data-compose'), 'Supplier Bank Data will be deleted', removeRow, div);
    });

    /* this function call when they account (add) button->dynamically add */
    function addAccount(tabRow) {
        let newDiv = accountRow.clone();
        newDiv.removeAttr('id');
        newDiv.find('input').prop('disabled', false).val('');
        newDiv.find('input.numeric').val(0);
        newDiv.find('button.view').remove();
        newDiv.find('div.file-input').remove();
        newDiv.find('.bootstrap-select').remove();
        newDiv.find('div.account-type').prepend(' <select   class="form-control selectpicker" name="type[]"><option selected value="0">Saving Account</option><option  value="1">Current Account</option></select>');
        newDiv.find('div.bank-document').prepend('<input type="file" name="bank_document[]" class="form-control bank-document">');
        newDiv.find('a').remove();
        newDiv.find('.delete-bank-doc').remove();
        newDiv.after('div:last').children().append('<div class="col-xl-4 col-lg-4 col-md-12"><button type="button" name="" class="bank-remove btn btn-default btn-sm btn-round remove float-right mt-3" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button></div>');
        if (tabRow) {
            if (!tabRow.next('div.account-row').length) {
                bankTbody.find(tabRow).last().after(newDiv);
            }
        } else {
            bankTbody.find('.account-row').last().after(newDiv);
        }
        bankDocumentName(bankTbody);
        bindBankEvents();
        onRowBootup(newDiv);
    }

    bindBankEvents();

    /*this was removing dynamically add row*/

    function bindBankEvents() {

        bankTbody.find('.remove').on('click', function () {
            removeRow($(this).closest('.account-row'));
        });
        /* if tab or enter key pressed*/
        bankTbody.children().find('input.bank_address:last').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {
                addAccount($(this).closest('.account-row'));

            }
        });
    }

    /******bank details end*****/

    function removeRow(div) {
        div.remove();
        bankDocumentName(bankTbody);
    }


    /* for supplier doc functions  */
    let supplierDocTable = $('#document-table'), supplierDocRow = $('#supplier-doc');
    $('#add-document').on('click', function () {
        addSupplierDoc();
    });

    function addSupplierDoc(newTable) {
        let newRow = supplierDocRow.clone();
        newRow.removeAttr('id');
        newRow.find('input').prop('disabled', false).val('');
        newRow.find('td:last').append('<button type="button" name="" class="doc-remove btn btn-default btn-sm btn-round remove float-right mt-2" tabindex="-1" ><i class="fa fa-minus text-danger"></i></button>');
        newRow.find('a').remove();
        newRow.find('div.file-input').remove();
        newRow.find('td.document').prepend('<input type="file" class="form-control document-file" name="supplier_doc">');
        supplierDocTable.find('.supplier-doc').last().after(newRow);
        datePicker(newRow);
        onRowBootup(newRow);
        supplierDocumentName($('#document-table'))
        bindDocEvents();
    }

    function supplierDocumentName(body) {
        let k = 0;
        body.find('input.document-file').each(function (k) {
            $(this).attr('name', 'document_file' + k);
            k++;
        });
    }

    bindDocEvents();

    function bindDocEvents() {
        supplierDocTable.find('.remove').on('click', function () {
            removeRow($(this).closest('.supplier-doc'));
        });

    }

    form.find('.delete-supplier-doc').on('click', function (e) {
        e.preventDefault();
        let id = $(this).data('id');
        deleteData('supplier/' + id + '/document/delete', 'Document will be deleted', deleteDoc, {
            element: $(this)
        });
    });
    /* supplier doc functions ends  */
    $("#submit").on("click", function () {

        let form = $('#form').valid();
        if (form) {
            sendData($('#data-url').val(), false);
        }
    });
}


function supplierTreatmentChange(treatmentVal, form)// supplier gst-treatment on change
{
    let gstIn = form.find('#gst-no'), state = form.find('#state');
    gstIn.prop({'disabled': false, 'required': true});
    state.prop('disabled', false).selectpicker('refresh');
    if (!gstIn.next().find('i').length) {
        gstIn.next().append('<i class="fa fa-asterisk"></i>');
    }
    if (treatmentVal == 2) { //unregistered
        gstIn.val('').prop({'disabled': true, 'required': false});
        gstIn.next().find('i').remove();
    } else if (treatmentVal == 4) { //overseas
        gstIn.val('').prop('required', false);
        gstIn.next().find('i').remove();
        state.prop('disabled', true).val(96).selectpicker('refresh');
    }
}

/* Quotation Call */
function quotationCall() {
    let form = $("#form"),
        multipleCurrencyCheckBox = form.find('#currencyMultiple'),
        hideTotalCheckBox = form.find('#hideTotal'),
        showIncomeCheckBox = form.find('#showIncome'),
        customer = form.find('#customer-id'),
        prospect = form.find('#prospect'),
        quotationTbody = form.find('#quotation-tbody'),
        containerTbody = form.find('#container-tbody'),
        modeType = form.find("#mode_type"),
        activity = form.find("#activity-code"),
        por = form.find("#por"),
        pol = form.find("select#pol"),
        pod = form.find("select#pod"),
        incoterm = form.find("#incoterm"),
        supplier = form.find("#supplier-id"),
        enquiryId = document.URL.split("?enquiry=")[1],
        dataId = $('#data-id').val(),
        postingDate = $('#posted_at'),
        validityDate = $('#validity_date');

    onBootup();
    setTypeahead();
    airTypeChange(activity);
    priceBuild();
    multiCurrency(multipleCurrencyCheckBox);
    hideTotal(hideTotalCheckBox);
    hideIncome(showIncomeCheckBox);
    callCalculation();
    bindEvent();

    /** Load Airport Seaport **/
    /*form.find('.portselect').on('show.bs.select', function () {
        portOnFocus($(this));
    });*/

    if (enquiryId) {
        $('.close').on('click', function () {
            refreshUrl();
        });
        form.find('#enquiryId').val(enquiryId);
        backgroundPostData(baseUrl + enquiryId + '/fetch', '', buildQuotation);
    }

    function buildQuotation(res) {
        let data = res.data;
        if (data.customer_id) {
            customer.val(data.customer_id);
            prospect.attr('disabled', true);
        } else if (data.prospect_id) {
            prospect.val(data.prospect_id);
            customer.attr('disabled', true);
        }
        activity.selectpicker('val', data.activity_code_id);
        supplier.selectpicker('val', data.supplier_id);
        incoterm.selectpicker('val', data.incoterms);
        por.val(data.por);
        let portMode = airTypeChange(activity);
        if (portMode !== modeType.val()) {
            modeType.val(portMode);
        }
        pol.html('<option selected value="' + data.pol + '">' + data.pol + '</option>');
        pod.html('<option selected value="' + data.pod + '">' + data.pod + '</option>');
        pol.add(pod).selectpicker('refresh');
        pol.selectpicker('val', data.pol);
        pod.selectpicker('val', data.pod);
        customer.add(prospect).selectpicker('refresh');
    }

    if (dataId !== "") {
        if (prospect.val() === "") {
            prospect.attr('disabled', true);
            prospect.selectpicker('refresh');
        }
        if (customer.val() === "") {
            customer.attr('disabled', true);
            customer.selectpicker('refresh');
        }
    }

    customer.on('change', function () {
        if ($(this).val() === '') {
            prospect.prop('disabled', false);
        } else {
            prospect.prop('disabled', true);
        }
        prospect.selectpicker('refresh');
    });

    prospect.on('change', function () {
        if ($(this).val() === '')
            customer.prop('disabled', false);
        else
            customer.prop('disabled', true);
        customer.selectpicker('refresh');
    });

    postingDate.datepicker().on('changeDate', function () {
        let currentPostingDate = $(this).datepicker('getDate', '+14d');
        currentPostingDate.setDate(currentPostingDate.getDate() + 14);
        validityDate.datepicker('setDate', currentPostingDate);
    });

    quotationTbody.sortable({
        axis: 'y',
        cursor: "grabbing",

        update: function (event, ui) {
            $('#dragged').val(1);
            rowSno('#quotation-tbody', true)
        }
    }).css('cursor', 'grab');

    /*on changing mode of transport*/

    activity.on('change', function () {
        let ele = $(this),
            activity = ele.val(),
            txt = ele.children('option:selected').text().trim();
        if (activity) {
            let portMode = airTypeChange($(this));
            if (portMode !== modeType.val()) {
                modeType.val(portMode);
            }
            showToastr(txt, "Terms and conditions for " + txt + " selected", "info");
            let url = baseUrl + activity + '/terms';
            backgroundPostData(url, '', activityCall, txt);
        } else
            showToastr("Select a Mode of transport", "You must choose a mode of transport", "error");
    });

    /*on selecting services*/
    form.find('#services').on('changed.bs.select', function (e, clickedIndex, newValue) {
        let selectedEle = $(this).find('option').eq(clickedIndex),
            selectedId = selectedEle.val(),
            selectedText = selectedEle.text(),
            s = $("select.service");
        if (newValue) {
            s.append('<option id=serv' + selectedId + ' value=' + selectedId + ' >' + selectedText + '</option>');
        } else {
            s.find('#serv' + selectedId).remove();
        }
        $('.service').selectpicker('refresh');
    });

    form.find('#tax').off('change').on('change', function () {
        callCalculation();
    });

    multipleCurrencyCheckBox.off('click').on('click', function () {
        $("select.currencyVal").val($("#currency").val());
        multiCurrency($(this));
    });

    hideTotalCheckBox.off('click').on('click', function () {
        hideTotal($(this));
    });

    showIncomeCheckBox.off('click').on('click', function () {
        hideIncome($(this));
    });

    /* new row click function with addRow function */
    form.find('#add').on('click', function () {
        newRow();
        if (!multipleCurrencyCheckBox.is(':checked')) {
            let select = $("select.currencyVal");
            select.val($("#currency").val());
            select.selectpicker('refresh');

        }
    });

    form.find('select.price_builds').on('change', function () {
        if ($(this).attr('id') === 'currency') {
            let select = $("select.currencyVal");
            select.selectpicker('val', $(this).val());
        }
        let trs = $('#quotation-table').find('tbody.quotation_tbody tr');
        trs.each(function () {
            getPriceBuild($(this));
        })
    });

    /*submitting quotation*/
    $("#submit").on('click', function (e) {
        let success = $("#form").valid(),
            url = form.find("#data-url").val();
        if (success)
            sendData(url, callBackDataTables, {dataTable: false});
    });

    /* bind click , keydown , keyup and changed event to */
    function bindEvent() {

        quotationTbody.on('click', ".remove", function () {
            let buttonRemove = $(this),
                id = buttonRemove.data('id'),
                url = baseUrl + id + '/quotation_sub/delete',
                title = buttonRemove.closest('tr').find('td.total-cost').text() + ' will be deleted';

            if (id !== '') {
                deleteData(url, title, removeRow, {target: buttonRemove, data: {'quotation_id': dataId}});
            } else
                removeRow({target: buttonRemove});
        });

        quotationTbody.on('keyup', ".quantity,.cost,.discount", function () {
            callCalculation();
        });

        quotationTbody.on('keydown', ".comment", function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                newRow();
                if (!multipleCurrencyCheckBox.is(':checked')) {
                    let select = $("select.currencyVal");
                    select.val($("#currency").val());
                    select.selectpicker('refresh');
                }
            }
        });

        quotationTbody.on('change', "select.description", function () {
            let val = $(this).find('option:selected').data('tax');
            $(this).closest('tr').find('input.hidden-tax').val(val);
            callCalculation();
        });
    }

    function activityCall(res, modeOfTransport) {
        let tAC = $('#termsAndCond');
        $('#modeOfTransport').text(modeOfTransport);
        let term, html = '';
        if (res.data) {
            let terms = res.data.terms_and_condition.split(';');
            terms = terms.filter(Boolean);
            for (term in terms) {
                html += '<li>' + terms[term] + '</li>'
            }
        }
        if (html)
            tAC.html(html);
        else {
            html = '<div class="alert-warning"><p>Terms and conditions for <small class="text-underline text-muted">' + modeOfTransport + '</small> is empty</p></div>';
            tAC.html(html);
        }
    }

    function airTypeChange(element) {
        let activityId = element.val(),
            portMode = 'Sea';
        if (activityId) {
            let mode = element.find('option[value=' + activityId + ']').data('mode');
            portMode = (mode === 'Air') ? 'Air' : 'Sea';
        }
        return portMode;
    }

    function multiCurrency(currencyBox) {
        let currency = $('select.currencyVal'),
            currencyRate = $("#currencyRate");
        if (currencyBox.is(':checked')) {
            $(".currencyVal").prop('disabled', false);
            currency.selectpicker('refresh');
            hideTotalCheckBox.prop('checked', true);
            hideTotalCheckBox.prop('disabled', true);
            $("#total").addClass('invisible');
            currencyRate.addClass('invisible');
        } else {
            $(".currencyVal").prop('disabled', true);
            currency.selectpicker('refresh');
            hideTotalCheckBox.prop('disabled', false);
            currencyRate.removeClass('invisible');
        }
    }

    function hideTotal(hideBox) {
        let total = $("#total");
        if (hideBox.is(':checked'))
            total.addClass('invisible');
        else
            total.removeClass('invisible');
    }

    function hideIncome(hideIncome) {
        let incomeColumn = $(".income");
        if (hideIncome.is(':checked'))
            incomeColumn.removeClass('hide');
        else
            incomeColumn.addClass('hide');
    }

    /* function for add dynamic row*/
    function newRow(tabRow) {
        let row = $('.quotation_row').first(),
            row1 = $('.container_row').first(),
            nRow = cloneRow(row),
            cRow = cloneRow(row1);
        nRow.find('td:last').html('<button type="button" name="" data-id="" tabindex="-1" class="btn btn-default btn-sm btn-round remove"><i class="fa fa-minus text-danger"></i></button>');
        if (tabRow) {
            quotationTbody.find(tabRow).after(nRow);
            containerTbody.find(tabRow).after(cRow);
        } else {
            quotationTbody.find('tr').last().after(nRow);
            containerTbody.find('table').last().after(cRow);
        }

        onRowBootup(nRow);
        onRowBootup(cRow);
        rowSno('#quotation-tbody', true);
        rowSno('#container-tbody', true);
        priceBuild()

    }

    /* function for remove row */
    function removeRow(options) {
        if (quotationTbody.find('tr').length === 1) {
            newRow();
        }
        let eq = quotationTbody.find(options.target).closest('tr').index();
        quotationTbody.find('tr').eq(eq).remove();
        containerTbody.find('tr').eq(eq).remove();
        rowSno('#quotation-tbody', true);
        rowSno('#container-tbody', true);
        callCalculation();

    }

    /* function for Calculation */

    function callCalculation() {

        let grandCost = 0, grandRevenue = 0, grandTotalTax = 0, grandQuanitity = 0, grandTotalCost = 0,
            grandTotalRevenue = 0, grandIncome = 0, diffAmount = 0, rate = parseFloat($("#currency-rate").val());

        $('.quotation_tbody tr').each(function () {
            let elem = $(this),
                quantity = parseFloat(elem.find('td').find('input.quantity').val()),
                cost = setAmount(elem.find('td').find('input.cost').val()),
                revenue = setAmount(elem.find('td').find('input.revenue').val()),
                discount = setAmount(elem.find('td').find('input.discount').val()),
                // adjustment =setAmount(elem.find('td').find('input.adjustment').val()),
                totalCost = ((quantity * cost) - discount).toFixed(fractionDigit),
                totalRevenue = parseFloat(quantity * revenue).toFixed(fractionDigit),
                taxRate = parseFloat(elem.find('select.description').find('option:selected').data('tax')),
                income = parseFloat((quantity * revenue) - (quantity * cost)).toFixed(fractionDigit);
            taxRate = isNaN(taxRate) || !$('#tax').prop('checked') ? 0 : taxRate;
            elem.children('td').find('input.hidden-tax').val(taxRate);
            let tax = parseFloat(totalRevenue * (taxRate / 100));

            elem.find('td.total_cost').text(totalCost);
            // elem.find('td.total-revenue').text(totalRevenue);
            // elem.find('td.income').text(income);
            // elem.find('td.tax').text(parseFloat(tax).toFixed(fractionDigit));
            elem.find('td.cell-amount').number(true, fractionDigit);

            grandQuanitity += quantity;
            grandCost += parseFloat(cost);
            // grandRevenue += parseFloat(revenue);
            grandTotalCost += parseFloat(totalCost);
            // grandIncTotalCost +=parseFloat(totalCost-adjustment-tax)
            // grandTotalRevenue += parseFloat(totalRevenue);
            // grandIncome += parseFloat(income);
            // grandTotalTax += tax;
        });

        $("#grandQuantity").html(grandQuanitity);
        $("#grandCost").html(grandCost);
        // $("#grandRevenue").html(grandRevenue);
        $("#grandTotalCost").html(grandTotalCost);
        // $("#grandTotalRevenue").html(grandTotalRevenue);
        // $("#grandIncome").html(grandIncome);
        // $("#grandTotalTax").html(parseFloat(grandTotalTax).toFixed(fractionDigit));
        $('#quotation-table tfoot td.cell-amount').number(true, fractionDigit);

    }

    /*function priceBuild */
    function priceBuild() {
        let priceBuild = quotationTbody.find('.price_build').add(containerTbody.find('.price_build'));
        priceBuild.on('change', function () {
            let selectPicker = quotationTbody.find('select'),
                tr = selectPicker.closest('tr'),
                index = parseInt(tr.find('td.slno').text()) - 1,
                containerType = containerTbody.find('select.containerType').eq(index),
                typeOfContainer = containerTbody.find('select.typeOfContainer').eq(index),
                containerSize = containerTbody.find('select.containerSize').eq(index),
                trailerType = containerTbody.find('select.trailerType').eq(index);
            if (selectPicker.hasClass('service')) {
                let serviceValue = selectPicker.val();
                containerType.add(containerSize, typeOfContainer, trailerType).prop('disabled', true).selectpicker('refresh');
                if (serviceValue === '2') {//freight
                    containerType.add(containerSize).prop('disabled', false).selectpicker('refresh');
                } else if (serviceValue === '4') {//transport
                    typeOfContainer.add(trailerType).prop('disabled', false).selectpicker('refresh');
                }
            }
            getPriceBuild(tr);
        });
    }

    /*function getPriceBuild */
    function getPriceBuild(tr) {
        let customerId = customer.val(),
            origin = $('#pol').val(),
            destination = $('#pod').val(),
            service = tr.find('select.service').val(),
            description = tr.find('select.description').val(),
            unit = tr.find('select.unit').val(),
            currency = tr.find('select.currency').val(),
            containerType = containerTbody.find('select.containerType').val(),
            typeOfContainer = containerTbody.find('select.typeOfContainer').val(),
            containerSize = containerTbody.find('select.containerSize').val(),
            trailerType = containerTbody.find('select.trailerType').val(),
            type = '',
            size = '';
        if (service === '2') {
            if (description && unit && containerType && containerSize && currency && origin && destination) {
                fetchPriceBuild(service, customerId, description, unit, currency, containerType, containerSize, origin, destination, tr);
            }
        } else if (service === '4') {
            if (description && unit && typeOfContainer && trailerType && currency && origin && destination) {
                fetchPriceBuild(service, customerId, description, unit, currency, typeOfContainer, trailerType, origin, destination, tr);
            }
        } else if (service && description && unit && currency) {
            fetchPriceBuild(service, customerId, description, unit, currency, type, size, origin, destination, tr);
        }
    }

    /*post data to priceBuild trait*/
    function fetchPriceBuild(service, customer, description, unit, currency, type, sizeOrTrailer, origin, destination, tr) {
        backgroundPostData(baseUrl + 'price-build', {
            service: service,
            customer: customer,
            description: description,
            unit: unit,
            origin: origin,
            destination: destination,
            currency: currency,
            type: type,
            sizeOrTrailer: sizeOrTrailer
        }, setPriceBuild, {alert: false, row: tr})
    }

    // /*set PriceBuild function*/
    function setPriceBuild(res, options) {
        let tr = options.row,
            oldCost = tr.find('[name="cost[]"]').val();
        if (res.data) {
            if (tr.find('[name="quantity[]"]').val() === '0') {
                tr.find('[name="quantity[]"]').val(1);
            }
            tr.find('[name="cost[]"]').val(res.data.cost);
            tr.find('[name="revenue[]"]').val(parseFloat(res.data.cost) + parseFloat(res.data.profit));
            callCalculation();
            if (oldCost !== tr.find('[name="cost[]"]').val())
                showToastr('Price build', 'Price build successfully set', 'info');
        }
    }

    ajaxSelectPicker();
}


/* Job Call */
function jobCall() {
    let dataId, dtUrl = 'job';
    onBootup();
    if (window.location.pathname == '/job/link') {
        $('#partner_changes').closest('li').remove();
        $('#base-tab9').closest('li').remove();
    }

    /*INITIAL BASIC ELE*/
    let formId = $('#form'),
        activityCode = $("#activity-code"),
        packageTab = $('#package'),
        packageTbody = $('#package-tbody'),
        containerTab = $('#container'),
        containerTbody = $('#container-tbody'),
        transportTbody = $('#transportation-tbody'),
        vehicleTbody = $('#vehicle-tbody'),
        permitTbody = $('#permit-tbody'),
        modeType = $("#mode_type"),
        containerCount = $('#container_count'),
        containerBtn = $('#container-create'),
        containerAll = $('.container_all_select');

    /*INITIAL ROWS*/
    let packageRow = $("#package-row"),
        containerRow = $("#container-row"),
        containerSubRow = $("#container-sub-row"),
        transportationRow = $("#transportation-row");

    let pickupDate = $('#pickup_date').val();

    let containerArr = ["20", "40", "LCL"];

    // @v4 tabChange('service-tabs');
    clipBoard();
    setTypeahead();
    airTypeChange(activityCode);
    if (dataId !== '') {
        changeActivity();
        // portSetValue();
    }
    bindEvents();

    /** Load Airport Seaport **/
    formId.find('.portselect').on('show.bs.select', function () {
        portOnFocus($(this));
    });


    /*CHANGE CUSTOMER*/
    formId.find('#customer-id').on('change', function () {
        let selectedOption = $(this).find('option:selected'),
            salesman = selectedOption.data('salesman'),
            address = selectedOption.data('address'),
            c_id = $(this).val(),
            options = formId.find('#secondary_customers_id');
        options.find('option:disabled').not('.dis-opt').prop('disabled', false);
        options.find('option[value=' + c_id + ']').prop('disabled', true);
        formId.find('#salesman').find('option[value=' + salesman + ']').prop('selected', true);
        formId.find('.selectpicker').selectpicker('refresh');
        formId.find('#deliver_address').val(address);
    });

    formId.find('#secondary_customers_id').on('change', function () {
        let values = $(this).val(),
            options = formId.find('#customer_id');
        options.find('option:disabled').not('.dis-opt').prop('disabled', false);
        $.each(values, function (index, value) {
            options.find('option[value=' + value + ']').prop('disabled', true);
        });
        formId.find('.selectpicker').selectpicker('refresh');
    });

    /* Delivery address edit option unlock */
    $('#delivery_lock').click(function () {
        let lockImg = $('#lockImage');
        $('#delivery_address').prop('disabled', function (i, v) {
            if (lockImg.hasClass('fa-lock')) {
                lockImg.removeClass('fa-lock').addClass('fa-unlock');
                $('#delivery_addr_change:not(.fixed_adrs)').prop('checked', true);
            } else {
                lockImg.removeClass('fa-unlock').addClass('fa-lock');
                $('#delivery_addr_change:not(.fixed_adrs)').prop('checked', false);
            }
            return !v;
        });
    });

    activityCode.on('change', function () {
        let portMode = airTypeChange($(this));
        if (portMode != modeType.val()) {
            modeType.val(portMode);
            /*setTimeout(function () {
                 portSelectRefresh();
             }, 500);*/
            $("#pol").html('').selectpicker('refresh');
            $("#pod").html('').selectpicker('refresh');
        }
    });

    $('#awb-bill-no').on('blur', function () {
        if ($(this).val() !== '') {
            stickLoader('Fetching Data', 'Fetching data for BL: ' + $(this).val());
            backgroundPostData('searates/' + $(this).val(), false, seaRatesApi, {type: 'GET'});
        }
    });

    function seaRatesApi(response) {
        showToastr('Success', response.message);
        response = response.data;
        $('#vessel_flt_number').val(response.vessel).addClass('border-success');
        $('#etd').val(response.etd).addClass('border-success');
        $('#eta').val(response.eta).addClass('border-success');
        $('#carrier').val(response.carrier).addClass('border-success');
        if (response.locations.length > 0) {
            $('#pol').prepend('<option selected data-subtext=' + response.locations[0]["code"] + ' value=' + response.locations[0]["name"] + '>' + response.locations[0]["name"] + '</option>');
            $('#pod').prepend('<option selected data-subtext=' + response.locations[1]["code"] + ' value=' + response.locations[1]["name"] + '>' + response.locations[1]["name"] + '</option>');
            $(".portselect").addClass('border-success').selectpicker('refresh');
            addContainers(response.containers);
        }
        //return false;
    }

    function addContainers(containers) {
        if (containerTbody.find('tr.parent-row').length == 1) {
            let containerSize = '', containerSizeSelect = '';
            $.each(containers.number, function (key, val) {
                if (key >= 1) {
                    containerTab.find("#add-container").trigger('click');
                    let newRow = containerTbody.find('tr.parent-row:last');
                    newRow.find('input.container_no').val(val);
                    if (containers.code[key]) {
                        containerSize = containers.code[key].includes(20) ? 20 : 40;
                        containerSizeSelect = newRow.find('select.container_name');
                        containerSizeSelect.val(containerSize).selectpicker('refresh');
                        containerSizeSelect.addClass('border-success');
                    }
                } else {
                    containerRow.find('input.container_no').val(val);
                    if (containers.code[key]) {
                        containerSize = containers.code[key].includes(20) ? 20 : 40;
                        containerSizeSelect = containerRow.find('select.container_name');
                        containerSizeSelect.val(containerSize).selectpicker('refresh');
                        containerSizeSelect.addClass('border-success');
                    }
                }
            });
            containerTbody.find('.container_no').trigger('keyup');
            containerTbody.find('.container_no').addClass('border-success');
        }
    }

    function airTypeChange(element) {
        let activityId = element.val(),
            portMode = 'Sea';
        if (activityId) {
            mode = element.find('option[value=' + activityId + ']').data('mode');
            portMode = (mode == 'Air') ? 'Air' : 'Sea';
        }
        return portMode;
    }

    function portSelectRefresh() {
        let string = $('#activity-code').find('option:selected').text().trim();
        $('.pol-select,.pod-select').attr('hidden', true);
        $('.pol,.pod').selectpicker('val', '');
        if (string) {
            if (string.includes('Air')) {
                $('#air-pol,#air-pod').removeAttr('hidden');
            } else {
                $('#sea-pol,#sea-pod').removeAttr('hidden');
            }
        }
    }

    function portSetValue() {
        let polElem = $('.pol-select:visible').find('.pol'),
            podElem = $('.pod-select:visible').find('.pod');
        polElem.selectpicker('val', $('#pol-val').val());
        podElem.selectpicker('val', $('#pod-val').val());
    }

    /*CHANGE SERVICE*/

    formId.find('#service').on('change', function () {
        changeActivity();
    });

    function changeActivity() {
        let transportEle = $('.transportation'),
            freight = $('#freight');
        $('.transportation,.customs,.warehousing').find('a').addClass('disabled').removeAttr('data-toggle');
        freight.addClass('hide');
        /*$('#service > option:selected').each(function (i) {
            option = (($(this).val()).toLowerCase()).replace(' ', '-');
            if ($.inArray(option, ['customs', 'freight', 'warehousing','.transportation']) !== -1) {
                $('.' + option).find('a').removeClass('disabled').attr('data-toggle', 'tab');
            }
        });*/

        /*$.each(formId.find('#service option:selected'), function () {
            let service = $(this).data('service').toLowerCase(),
                endChar = service.substr(0, service.indexOf(' ')),
                serviceClassName = endChar ? service.substr(0, service.indexOf(' ')) : service;
            if ($.inArray(serviceClassName, ['customs', 'freight', 'warehousing']) !== -1) {
                $('.' + serviceClassName).find('a').removeClass('disabled').attr('data-toggle', 'tab');
            } else if (service == 'transportation') {
                transportEle.find('a').removeClass('disabled').attr('data-toggle', 'tab');
            }
        });*/
        $.each(formId.find('#service option:selected'), function () {
            let service = $(this).data('service').toLowerCase(),
                endChar = service.substr(0, service.indexOf(' ')),
                serviceClassName = endChar ? service.substr(0, service.indexOf(' ')) : service;
            if ($.inArray(serviceClassName, ['customs', 'warehousing']) !== -1) {
                $('.' + serviceClassName).find('a').removeClass('disabled').attr('data-toggle', 'tab');
            } else if (service === 'transportation') {
                transportEle.find('a').removeClass('disabled').attr('data-toggle', 'tab');
                if ($('#data-id').val() !== 'null' && transportTbody.find('tr').length === 1
                    && transportationRow.find('select.type').val() === '') {
                    //cloneContainers();
                }
            } else if ($.inArray(serviceClassName, ['freight']) === 0) {
                freight.removeClass('hide');
            }
            if (freight.hasClass('hide')) {
                freight.find('select#incoterm').val('').selectpicker('refresh');
            }
        });
    }


    /*SERVICE DISABLED TOOLTIP*/
    /*$('.nav-tabs li').hover(function () {
        let thisEle = $(this);
        if ($(thisEle).hasClass('disabled')) {
            $(thisEle).tooltip();
        } else {
            $(thisEle).tooltip('destroy')
        }
    });*/

    formId.find('#pickup_date').on('change', function () {
        let dataId = formId.find('#data-id').val(),
            newDate = $(this).val();
        if (dataId != 'null' && pickupDate && (pickupDate != newDate)) {
            let reason = formId.find('#pickup_reason');
            $('#pickup_reason_grp').removeClass('hide');
            reason.attr('disabled', false);
        }
    });

    formId.find("#pickup_log").off('click').on('click', function () {
        let dataId = formId.find('#data-id').val();
        getDataInModal('job/pickup/log/' + dataId, 'Pickup Log', false, {'size': 'medium', 'buttons': false})
    });

    /* Permit Type */
    formId.find('#permit_type').on('change', function () {
        let permits = $(this).children('option:selected'),
            permitTable = $("#permit-table"),
            permit_types = [],
            permitSelected = [];

        permitTable.attr('hidden', '');
        $("#permit-tbody tr").each(function () {
            $(this).attr('hidden', '');
            permitSelected.push($(this).data('permit'));
        });
        permits.each(function (index) {
            let pid = parseInt($(this).val());
            if (jQuery.inArray(pid, permitSelected) === -1) {
                addPermitType(pid, $(this).text());
            }
            permitTbody.find("[data-permit='" + pid + "']").removeAttr('hidden');
        });
        if (permits.length > 0) {
            permitTable.removeAttr('hidden');
        }

    });

    function addPermitType(id, type) {
        let trc = $("#permit-tbody tr").length,
            tr_no = parseInt(trc) + 1,
            sfda_file_name = 'permitfile_' + type;
        let newRow = '<tr data-permit="' + id + '"><input type="hidden" value="" name="sfda_id[]"><td>' + tr_no + '</td>';
        newRow += '<td><input type="hidden" value="' + id + '" name="permit_type_id[]"><input type="text" value="' + type + '" name="permit_type[]" class="form-control permit_type" disabled="true"></td>';
        newRow += '<td><input type="text" value="" name="sfda_no[]" class="form-control sfda_no" maxlength="128"></td>';
        newRow += '<td><input type="text" value="" name="sfda_date[]" class="form-control sfda_date datepicker"></td>';
        newRow += '<td><input type="text" value="" name="sfda_expire_date[]" class="form-control sfda_expire_date datepicker"></td>';
        newRow += '<td><input type="file" value="" name="' + sfda_file_name + '" class="file sfda_file"></td>';
        newRow += '</tr>';
        if (trc == 0) {
            $("#permit-table").removeClass('d-none');
            permitTbody.html(newRow);
        } else {
            permitTbody.find('tr').last().after(newRow);
        }
        datePicker(permitTbody);
        fileInput(permitTbody);
        bindEvents();
    }

    /*ADD CONTAINER */
    packageTab.find("#add-package").off('click').on('click', function () {
        if (packageRow.find('td:last').hasClass('d-none'))
            packageRow.find('td:last').removeClass('d-none');
        addPackage();
    });

    function addPackage(tabRow) {
        let newRow = cloneRow(packageRow), i;
        if (newRow.hasClass('d-none'))
            newRow.removeClass('d-none');
        newRow.find('td:last').html('<button type="button" name="" data-id="" tabindex="-1" class="btn btn-default btn-sm btn-round remove_package"><i class="fa fa-minus text-danger"></i></button>');
        if (tabRow)
            packageTbody.find(tabRow).after(newRow);
        else
            packageTbody.find('tr').last().after(newRow);
        //i = newRow.index(); // For setting same index for package and transportation row
        i = Math.floor(Math.random() * 100000);
        newRow.attr('data-type', i);
        onRowBootup(newRow);
        packageRowno("#package-tbody");
        newTransportationRow(tabRow, i);
        bindEvents();
    }

    function removePackage(ele) {
        let packageTr, button, transportTr, i;
        //with id
        if (ele.extras) {
            packageTr = ele.extras.closest('tr');
            button = ele.extras;
        }
        //Transport row
        i = packageTr.data('type');
        transportTr = transportTbody.find('tr[data-type=' + i + ']');
        if (button.closest('tr#package-row').length) {
            packageTr.find('input,textarea').val('');
            packageTr.find('input.numeric,input.decimal').val(0);
            packageTr.find('select').val('');
            packageTr.find('select').selectpicker('refresh');

            transportTr.find('input').val('');
        } else {
            packageTr.remove();
            transportTr.remove();
        }

        packageRowno("#package-tbody");
    }

    function packageRowno(tbodyName, draggableIcon) {
        let icon = (draggableIcon) ? 'draggable-icon' : '';
        let elements, name, s;
        let sno = 0;
        $(tbodyName).find('tr').each(function (k) {
            if (!$(this).hasClass('d-none')) {
                sno++;
            }
            $(this).find('td:first').html(sno).addClass(icon);
            elements = $(this).find('td').find('input,select,textarea');
            elements.each(function (i, e) {
                if ($(this).attr('name')) {
                    name = $(e).attr('name');
                    if (name.includes('[')) {
                        s = name.substr(0, name.indexOf('['));
                        $(this).attr('name', s + '[' + k + ']');
                    }
                }
            });
        });
    }

    //CALCULATE PACKAGE
    function calculatePackageRow(that) {
        let row = that.closest('tr'),
            calculateEle = row.find('td'),
            qtyEle = calculateEle.find('input.package_quantity'),
            weightEle = calculateEle.find('input.package_weight'),
            totalWeightEle = calculateEle.find('input.package_total_weight'),
            length = calculateEle.find('input.package_length').val(),
            width = calculateEle.find('input.package_width').val(),
            height = calculateEle.find('input.package_height').val(),
            qty = qtyEle.val(),
            weight = weightEle.val(),
            totalWeight = totalWeightEle.val(),
            volume = ((qty * (length * width * height)) / 1000000),
            packElem = that[0];

        if (packElem === totalWeightEle.get(0)) {
            weight = qty > 0 ? totalWeight / qty : 0;
            weightEle.val(weight);
        } else {
            if (qty > 0) {
                totalWeight = qty * weight;
                totalWeightEle.val(totalWeight);
            }
        }
        calculateEle.find('input.package_volume').val(volume);
    }

    /*ADD CONTAINER AND TRANSPORTATION*/
    containerTab.find("#add-container").off('click').on('click', function () {
        appendContainer();
    });

    /* Container All Select */
    containerTab.find('#container-create').on('click', function () {
        if ($(this).hasClass('btn-primary')) {
            let firstRow = containerTbody.find('tr:last'),
                totalCount = containerCount.val();
            if (totalCount > 0) {
                if (containerTbody.find('tr.parent-row').length == 1) {
                    containerApplySelect(firstRow);
                }
                containerBtn.attr('disabled', true);
                for (i = 1; i <= totalCount; i++) {
                    appendContainer(null, 1);
                    if (i == totalCount) {
                        containerBtn.removeAttr('disabled');
                    }
                }
            }

        } else {
            let checkedItems = $('.container-check:checkbox:checked');
            checkedItems.each(function () {
                let containerRow = containerTbody.find($(this)).closest('tr.parent-row');
                containerApplySelect(containerRow);
            });
        }
        //containerBtn.removeAttr('disabled');
    });

    containerCount.on('keydown keyup', function (e) {
        if ($(this).val() > 30
            && e.keyCode !== 46 // keycode for delete
            && e.keyCode !== 8 // keycode for backspace
        ) {
            e.preventDefault();
            $(this).val(30);
        }
    });

    function containerBtnAction(chk) {
        if (chk == 1) {
            containerBtn.removeClass('btn-primary').addClass('btn-warning');
            containerBtn.html('Edit');
            containerCount.prop('disabled', true);
        } else {
            containerBtn.removeClass('btn-warning').addClass('btn-primary');
            containerBtn.html('Create');
            containerCount.prop('disabled', false);
        }
    }

    function appendContainer(tabRow, sel) {
        if (containerRow.find('tr:odd').hasClass('d-none'))
            containerRow.find('tr:odd').removeClass('d-none');
        let newRow = containerRow.clone(),
            newSubRow = containerSubRow.clone(), i;
        if (newRow.hasClass('d-none'))
            newRow.removeClass('d-none');

        newSubRow.removeAttr('id');
        newSubRow.addClass('d-none');

        newRow.removeAttr('id');
        //newRow.find('td:last').removeClass('d-none');
        newRow.addClass('parent-row');
        newRow.find('td:last').html('<button type="button" name="" data-id="" tabindex="-1" class="btn btn-default btn-sm btn-round remove remove_details"><i class="fa fa-minus text-danger"></i></button>');

        newRow.find('.bootstrap-select').each(function () {
            $(this).find('button,div,option.bs-title-option').remove();
            let h = $(this).html();
            if ($(this).hasClass('qty_type')) {
                $(this).closest('.input-group-append').html(h);
            } else {
                $(this).closest('td').html(h);
            }
        });
        newRow.find('input,textarea,select').val('');
        newRow.find('input.numeric').val(0);
        //newRow.find('.temperature').attr('readonly', true);
        newSubRow.find('input,textarea,select').val('');
        newSubRow.find('input.numeric').val(0);
        newSubRow.find('.temperature').attr('readonly', true);

        if (tabRow) {
            containerTbody.find(tabRow).after(newRow);
        } else {
            containerTbody.find('tr:odd').last().after(newRow);
            containerTbody.find('tr:even').last().after(newSubRow);
        }
        i = Math.floor(Math.random() * 100000);
        newRow.attr('data-type', i);  // For setting same index for package and transportation row
        onRowBootup(newRow);
        containerRowno("#container-tbody");
        if (sel) {
            containerApplySelect(newRow);
        }
        newTransportationRow(tabRow, i);
        bindEvents();
    }

    function newTransportationRow(tabRow, i) {
        let newTransportRow = cloneRow(transportationRow), row;
        if (tabRow) {
            row = transportTbody.find('tr[data-type=' + tabRow.index() + ']');
        } else {
            row = transportTbody.find('tr').last();
        }
        newTransportRow.attr('data-type', i);
        row.after(newTransportRow);
        onRowBootup(newTransportRow);
        datePicker(transportTbody);
        newTransportRow.find('select.type').selectpicker();
        rowSno("#transportation-tbody");
    }

    function containerRowno(tbodyName, btn) {
        let sno = 0;
        $(tbodyName).find('tr.parent-row').each(function (i) {
            /*if (!$(this).hasClass('d-none')) {
                sno++;
            }*/
            ckId = $(this).data('type');
            sno++;
            let checkDiv = '<div class="custom-control custom-checkbox">' +
                '<input type="checkbox" id="chk-' + (ckId) + '"  class="custom-control-input container-check">' +
                '<label class="custom-control-label pointer" for="chk-' + (ckId) + '">' + sno + '</label>' +
                '</div>';
            $(this).find('td:first').html((checkDiv));
        });
        if (btn) {
            containerBtnAction(0);
        }
    }

    function containerApplySelect(newRow) {
        containerAll.each(function (i) {
            let selectVal = $(this).val(),
                typeClass = $(this).data('class'),
                containerSelect = newRow.find('.' + typeClass);
            if (selectVal) {
                if (selectVal == "RF") {
                    containerSelect.closest('tr').find("input.temperature").removeAttr('readonly');
                } else {
                    containerSelect.closest('tr').find("input.temperature").attr({'readonly': 'readonly'});
                }
                containerSelect.val(selectVal);
                containerSelect.selectpicker('refresh');

                if (typeClass == 'container_name') {
                    containerSetLimit(containerSelect);
                }
            }
        });

    }

    function removeContainer(ele) {
        let containerTr, containerSubTr, button, transportTr, i;

        if (ele.extras) {
            containerTr = ele.extras.closest('tr.parent-row');
            containerSubTr = ele.extras.closest('tr.parent-row').next('tr');
            button = ele.extras;
        }

        //Transport row
        i = containerTr.data('type');
        transportTr = transportTbody.find('tr[data-type=' + i + ']');
        if ((button.closest('#container-tbody').find('tr.parent-row').length) === 1) {
            containerTr.find('input,textarea').val('');
            containerTr.find('input.numeric,input.decimal').val(0);
            containerTr.find('select').val('');
            containerTr.find('select').selectpicker('refresh');

            containerSubTr.find('input,textarea').val('');
            containerSubTr.find('input.numeric,input.decimal').val(0);
            containerSubTr.find('select').val('');
            containerSubTr.find('select').selectpicker('refresh');

            transportTr.find('input').val('');
        } else {
            containerTr.remove();
            containerSubTr.remove();
            transportTr.remove();
        }
        containerRowno("#container-tbody");
        rowSno("#transportation-tbody");
        bindEvents();
    }

    function containerSetLimit(ele) {
        let c = ele.closest('tr.parent-row').find('.container_no');
        if (jQuery.inArray(ele.val(), containerArr) === -1) {
            c.attr('maxLength', 32);
        } else {
            if (c.val() !== '') {
                c.val(c.val().substr(0, 11));
            }
            c.attr('maxLength', 11);
        }
    }

    /*Container Import*/
    $('#container-import-btn').on('click', function () {
        $("#container-import").trigger('click');
    });

    $('#container-import').on('change', function () {
        if ($(this).val() != '') {
            let btn = $("#container-import-btn");
            btn.addClass('bg-success');
            btn.find('i').removeClass('fa-upload').addClass('fa-check-circle');
        }
    });

    /*Package Import*/
    $('#package-import-btn').on('click', function () {
        $("#package-import").trigger('click');
    });

    $('#package-import').on('change', function () {
        if ($(this).val() != '') {
            let btn = $("#package-import-btn");
            btn.addClass('bg-success');
            btn.find('i').removeClass('fa-upload').addClass('fa-check-circle');
        }
    });

    /*BIND EVENT IN DYNAMIC ROWS*/
    function bindEvents() {

        /*PACKAGE*/
        packageTab.find(".package").on('keyup', function () {
            calculatePackageRow($(this));
        });

        packageTab.find('.package_remarks').off('keydown').on('keydown', function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                let tabRow = $(this).closest('tr');
                addPackage(tabRow);
            }
        });
        packageTab.find('.remove_package').off('click').on('click', function () {
            let id = $(this).data('id');
            if (id !== '') {
                let url = dtUrl + '/' + id + '/delete/sub/package';
                deleteData(url, 'Want to delete Package', removePackage, {extras: $(this), callDt: false});
            } else
                removePackage({extras: $(this)});
        });
        /*PACKAGE END*/

        /*Container Tab Events */
        containerTab.find('.container_remarks').off('keydown').on('keydown', function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                let tabRow = $(this).closest('table');
                appendContainer(tabRow);
            }
        });

        containerTab.find('.more_details').off('click').on('click', function () {
            $(this).closest('tr.parent-row').next('tr').removeClass('d-none');
        });

        containerTab.find('.remove_details').off('click').on('click', function () {
            let id = $(this).data('id'),
                containerNo = $(this).closest('tr.parent-row').find('.container_no').val();
            if (id !== '') {
                let url = dtUrl + '/' + id + '/delete/sub/container',
                    titleContainer = 'Want to delete Container';
                if (containerNo)
                    titleContainer += ' <strong>' + containerNo + '</strong>';
                deleteData(url, titleContainer, removeContainer, {extras: $(this), callDt: false});
            } else
                removeContainer({extras: $(this)});
        });

        containerTab.find("select.container_type").on('change', function () {
            let tempInput = $(this).closest('tr.parent-row').next('tr').find("input.temperature");
            if ($(this).val() == "RF") {
                tempInput.removeAttr('readonly');
            } else {
                tempInput.val('');
                tempInput.attr({'readonly': 'readonly'});
            }
        });

        containerTbody.find('.container').on('change', function () {
            let closestEle = $(this).closest('tr.parent-row').find('select.container');
            let checkTr = transportTbody.find('table[class=0-' + $(this).closest('tr.parent-row').index() + ']');
            let readonly = closestEle.val() !== '' ? false : true;
            checkTr.find('input,select').prop('readonly', readonly);
        });

        /** VGM on weight change **/
        containerTbody.find('.tare_weight,.container_weight').off('keyup').on('keyup', function (e) {
            let tare_weight = $(this).closest('tr.parent-row').find('.tare_weight').val(),
                container_weight = $(this).closest('tr.parent-row').find('.container_weight').val(),
                vgm_frieght = parseFloat(tare_weight) + parseFloat(container_weight);
            if (!isNaN(vgm_frieght)) {
                $(this).closest('table').find('.vgm_weight').val(vgm_frieght);
            }
        });

        /** Add Container No to Transportation Tab ***/
        containerTbody.find('.container_no').off('keyup').on('keyup', function (e) {
            let i = $(this).closest('tr').index() / 2;
            if (i === 0) {
                transportTbody.find('tr:eq(' + i + ')').find('.type').selectpicker('val', '0');
            }
            transportTbody.find('tr:eq(' + i + ')').find('.tr_container_no').val($(this).val());
        });

        packageTab.find('.package_type').on('change', function () {
            if ($(this).val() !== '') {
                let i = $(this).closest('tr').index();
                if (i === 0) {
                    transportTbody.find('tr:eq(' + i + ')').find('.type').selectpicker('val', '1');
                }
                transportTbody.find('tr:eq(' + i + ')').find('.tr_container_no').val($(this).val());
            }
        });


        /** Click to change container select options */
        $("#all-container-check").on('click', function () {
            $('.container-check').prop('checked', $(this).prop('checked'));
            let checked = $(this).is(":checked") ? 1 : 0;
            containerBtnAction(checked);
        });
        $('.container-check').on('click', function () {
            let checked = $(this).is(":checked") ? 1 : 0;
            containerBtnAction(checked);
        });

        containerTab.find("select.container_name").on('change', function () {
            containerSetLimit($(this));
        });

    }


    //SUBMIT FORM
    $("#submit,#navInvoice").on('click', function () {
        let success = formId.valid(),
            permitTr = $('#permit-tbody tr'),
            url = formId.find("#data-url").val(),
            id = $(this).attr('id'),
            awBillNo = $("#awb-bill-no").val();
        if (permitTr.length) {
            permitTr.each(function () {
                if ($(this).is(":hidden")) {
                    $(this).remove();
                }
            });
        }
        if (success) {
            options = {
                title: "AWB/MBL NO Empty",
                text: "AWB/MBL NO is empty. Do you want to continue",
                confirmText: 'Yes',
                confirmCallBack: jobSubmit
            };
            if (awBillNo === '')
                confirmBox(options);
            else
                jobSubmit();

            function jobSubmit() {
                if (id === 'navInvoice')
                    sendData(url, invoiceRedirect, {alert: 'toastr'});
                else
                    sendData(url);
            }
        }
    });

    /********************************* Vehicle Tab Starts **************************************/

    $('#add-vehicle').on('click', function () {
        newVehicleRow();
    });

    vehicleTbody.on('click', ".remove", function () {  //remove sub row( - button)
        let buttonRemove = $(this),
            id = buttonRemove.data('id'),
            url = 'job/' + id + '/delete/sub/vehicle',
            title = '<b>Chassis No: </b>' + buttonRemove.closest('tr').find('td.form-group').children('.chassis_no').val() + ' will be deleted';
        if (id !== '') {
            deleteData(url, title, removeRow, {target: buttonRemove, data: {'vehicle_id': id}});
        } else
            removeRow({target: buttonRemove});
    });

    vehicleTbody.on('keydown', ".description", function (e) { //add row while clicking tab key
        if (e.keyCode === 13 || e.keyCode === 9) {
            newVehicleRow();
        }
    });

    /* function for add vehicle dynamic row */
    function newVehicleRow(tabRow) {
        let row = $('.vehicle-row').first(),
            nRow = cloneRow(row);
        nRow.find('td:last').html('<button type="button" name="" data-id="" tabindex="-1" class="btn btn-default btn-sm btn-round remove"><i class="fa fa-minus text-danger"></i></button>');
        if (tabRow) {
            vehicleTbody.find(tabRow).after(nRow);
        } else {
            vehicleTbody.find('tr').last().after(nRow);
        }
        onRowBootup(nRow);
        rowSno('#vehicle-tbody', false);
    }

    function removeRow(options) {
        let eq = vehicleTbody.find(options.target).closest('table').index();
        vehicleTbody.find('table').eq(eq).remove();
        rowSno('#vehicle-tbody', false);
    }

    /********************************* Vehicle Tab Ends **************************************/

    function invoiceRedirect(res) {
        window.open('/invoice/supplier/list/' + res.data.id);
    }

    /*Job Import*/
    $('#job-import-btn').on('click', function () {
        $("#job-import").trigger('click');
    });

    $('#job-import').on('change', function () {
        if ($(this).val() != '') {
            let btn = $("#job-import-btn");
            btn.addClass('bg-success');
            btn.find('i').removeClass('fa-upload').addClass('fa-check-circle');
        }
    });

    $("#fullJobImport").on('click', function () {
        sendData(getUrl() + 'job/import/job', false, {alert: 'toastr'});
    })

    formId.find("#partner-changes").off('click').on('click', function () {
        let dataId = formId.find('#data-id').val();
        getDataInModal('job/link/' + dataId, 'Job Changes', UpdatePartnerData, {
            closeModal: 0,
            size: 'medium',
        });
        return false;
    });

    //Ajax selectpicker
    ajaxSelectPicker();

}

/*===set column data from partner===*/
/*function setColumnData(data) {
    for(i=0; i<(Object.keys(data.job).length);i++){
        $('#'+Object.keys(data.job)[i]).val(Object.values(data.job)[i]);
    }
    for(j=0; j<(Object.keys(data.jobGeneral).length);j++){
        $('#'+Object.keys(data.jobGeneral)[j]).val(Object.values(data.jobGeneral)[j]);
    }
    for(k=0; k<(Object.keys(data.jobClearance).length);k++){
        $('#'+Object.keys(data.jobClearance)[k]).val(Object.values(data.jobClearance)[k]);
    }
    $('#notification_changes').remove();
}*/

/*Ajax Selectpicker */
function ajaxSelectPicker() {
    var options = {
        ajax: {
            url: getUrl() + 'ports/search',
            type: 'POST',
            dataType: 'json',
            // automatically replace it with the value of the search query.
            /*data: {
                q: '{{{q}}}',
                type: $("#mode_type").val()
            }*/
            data: function () {
                var params = {
                    q: '{{{q}}}'
                };
                if ($("#mode_type").val()) {
                    params.type = $("#mode_type").val();
                }
                return params;
            }
        },
        minLength: 2,
        cache: false,
        clearOnEmpty: true,
        locale: {
            emptyTitle: 'Select and Begin Typing'
        },
        log: 3,
        preserveSelected: false,
        preprocessData: function (data) {
            var i, l = data.length, array = [];
            if (l) {
                for (i = 0; i < l; i++) {
                    array.push($.extend(true, data[i], {
                        text: data[i].port_name,
                        value: data[i].port_code,
                        data: {
                            subtext: data[i].port_code
                        }
                    }));

                }
            }
            // You must always return a valid array when processing data. The
            // data argument passed is a clone and cannot be modified directly.
            return array;
        }
    };

    $('.with-ajax').selectpicker().ajaxSelectPicker(options);
    //$('select').trigger('change');
}

/* Payment Voucher Call */
function paymentVoucherCall() {
    let form = $('#form'),
        remainingAmount = form.find('#remaining_amount'),
        generalTbody = form.find('#general-tbody'),
        serviceTbody = form.find('#service-tbody'),
        generalRow = generalTbody.find('tr:first'),
        serviceRow = serviceTbody.find('tr:first'),
        matchObj = {},//initialize
        status = $("#nav-tabs").find("li a.active").data('id');

    onBootup(form);
    bindTBodyEvents();
    callCalculation();
    voucherCommonEvents(form, 'finance/voucher/payment/', callCalculation);

    form.find('#total_amount,#currency-rate').on('keyup', function () {
        callCalculation();
    });

    form.find('#currency').on('change', function () {
        currencyConvert($(this).val(), callCalculation);
    });

    form.find('#addNew').on('click', function () {
        newRow();
    });

    $("#submit").on('click', function () {
        let success = form.valid(),
            totalAmount = $("#total_amount"),
            voucher_type = $('#voucher_type').val(),
            remaining_amount = $("#remaining_amount"),
            url = $("#data-url").val();

        if (success) {
            let check = true, count = 0;
            generalTbody.find('tr').each(function () {
                let transactionType = $(this).find('td').find('select.transaction_type'),
                    transactionId = $(this).find('td').find('select.transaction_id'),
                    account = $(this).find('td').find('select.accounts'),
                    jobs = $(this).find('td').find('select.jobs');

                if (transactionId.val() === '' && transactionType.val() !== 'Bank Charges' && transactionType.val() !== 'Own Account') {
                    $(transactionId).closest('td').addClass('error');
                    check = false;
                    count++;
                }
                if (transactionType.val() === 'Project' || transactionType.val() === 'Own Account') {
                    if (account.val() === '') {
                        $(account).closest('td').addClass('error');
                        check = false;
                        count++;
                    }
                }
                if (transactionType.val() === 'Job') {
                    if (jobs.val() === '') {
                        $(jobs).closest('td').addClass('error');
                        check = false;
                        count++;
                    }
                }
            });
            if (check) {
                let amount = setAmount(totalAmount.val());
                totalAmount.closest('td').removeClass('error');
                if (amount === 0 && voucher_type !== 'N')
                    showToastr('Error', 'Voucher Not allowed with zero Total Amount', 'error');
                else if ((voucher_type === 'BCV' || voucher_type === 'CCV') && amount <= 0) {
                    totalAmount.closest('div').removeClass('validate').addClass('error');
                    showToastr('Error', voucher_type + ' accept only debit values', 'error');
                } else if ((voucher_type === 'BPV' || voucher_type === 'CPV') && amount >= 0) {
                    totalAmount.closest('div').removeClass('validate').addClass('error');
                    showToastr('Error', voucher_type + ' accept only credit values', 'error');
                } else if (voucher_type === 'N' && amount !== 0) {
                    totalAmount.closest('div').removeClass('validate').addClass('error');
                    showToastr('Error', 'Total Amount Should be zero', 'error');
                } else if (parseFloat(remaining_amount.val()) !== 0) {
                    remaining_amount.closest('div').removeClass('validate').addClass('error');
                    showToastr('Error', 'Remaining Amount Should be Zero', 'error');
                } else
                    sendData(url, false, {extras: status});
            } else showToastr('Error', count + ' Field(s) are need to be filled', 'error');
        }
    });

    function bindTBodyEvents() {
        generalTbody.on('keyup', 'input.amount', function () {
            callCalculation();
        });

        generalTbody.on('change', 'select.transaction_type', function () {
            $(this).closest("tr").find('button.match-btn').addClass('d-none');
            callTransactionChange($(this));
        });

        generalTbody.on('change', 'select.transaction_id', function () {
            let transactionType = $(this).closest('tr').find('td').find('select.transaction_type').val(),
                matchButton = $(this).closest('tr').find('button.match-btn'),
                id = $(this).find('option:selected').attr('data-id');

            matchButton.addClass('d-none');
            if (transactionType === 'Customer' || transactionType === 'Supplier' || transactionType === 'Truck') {
                matchButton.removeClass('d-none');
                if (transactionType !== 'Truck') {
                    stickLoader(transactionType, 'Getting ' + transactionType + ' related jobs', true);
                    let options = {
                        element: $(this),
                        name: transactionType
                    };
                    backgroundPostData('finance/voucher/payment/jobs/' + id + '/' + transactionType, false, appendJob, options);
                }
            }
        });

        $('#view-file').on('click', function () {
            let id = $(this).data('id'),
                rowNo = $(this).data('row_no'),
                url = 'finance/voucher/payment/' + id + '/file/upload';
            getDataInModal(url, __('Payment Voucher') + ' ' + __('Upload') + ' - ' + rowNo, uploadCall, {
                size: 'medium',
                buttons: false
            })
        });

        generalTbody.on('keydown', ".text", function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                let tabRow = $(this).closest('tr');
                newRow(tabRow);
            }
        });

        generalTbody.on('click', "button.remove", function () {
            let tr = $(this).closest('tr'),
                id = $(this).data('id'),
                title = tr.find('select.transaction_type').find('option:selected').text(),
                amount = tr.find('input.amount').val();
            if (id) {
                deleteData('finance/voucher/payment/' + id + '/sub/delete', title + ' (<b>' + amount + '</b>) will be deleted', removeRow, {target: $(this)});
            } else
                removeRow({target: $(this)});
        });

        generalTbody.on('click', 'button.match-btn', function () {
            matchObj = {};//make empty
            let matchTr = $(this).closest('tr'),
                transactionType = matchTr.find('td').find('select.transaction_type').val(),
                transactionId = matchTr.find('td').find('select.transaction_id').val();

            $("#row_reference").val(matchTr.attr('id'));
            matchTr.find('td').find('select.jobs').selectpicker('val', '');
            if (transactionType !== '' && transactionId !== '') {
                if (transactionType === 'Customer' || transactionType === 'Supplier' || transactionType === 'Truck') {
                    let url = getUrl() + 'finance/voucher/payment/' + transactionId + '/' + transactionType + '/matching';

                    $("#voucherBox").carousel('next');
                    $("#matching-section").load(url, false, matchingDT);
                }
            } else
                showToastr('Warning', 'You should choose transaction type and transaction id', 'error');
        });
    }

    function appendJob(response, options) {
        let eleId = $(options.element).closest('tr').find('td').find("select.jobs");
        eleId.html('');
        let opt = "<option value=''>Select</option>";
        let jobs = response;
        (!jobs.length) ? showToastr('Error', 'No Job for this ' + options.name, 'error') : showToastr('Success', jobs.length + ' jobs loaded', 'success');
        for (i = 0; i < jobs.length; i++) {
            opt += "<option data-id='" + jobs[i]['id'] + "' value='" + jobs[i]['row_no'] + "'>" + jobs[i]['row_no'] + "</option>";
        }
        $(eleId).html(opt);
        $(eleId).selectpicker('refresh');
    }

    function uploadCall() {
        let listTab = $('#base-tab2');
        $('#base-tab1').add(listTab).hide();
        listTab.trigger('click');

        $('.delete').off('click').on('click', function () {
            let element = $(this),
                url = 'finance/voucher/payment/' + element.data('id') + "/file/delete";
            deleteData(url, '', function () {
                element.closest('tr').remove();
                rowSno('#file-list')
                $('.close').off('click').on('click', function () {
                    pageReload();
                });
            }, {alert: true, callDt: false});
        });

    }

    function newRow() {
        let newRow = cloneRow(generalRow),
            matchingButton = '<button class="btn btn-success btn-round btn-sm match-btn d-none" type="button"><i class="fa fa-link"></i></button>';
        if ($('#data-id').val())// while editing match button disables
            matchingButton = '';
        newRow.removeAttr('id');
        newRow.attr('id', 'PV-' + random());
        newRow.find('input.amount,select.transaction_type').removeAttr('disabled');
        newRow.find('select.transaction_id').html('');
        newRow.find('select.jobs').html('');
        newRow.find('td:last').html(matchingButton + '<button type="button" class="btn btn-default btn-round btn-sm float-right  remove" tabindex="-1"><i class="fa fa-minus text-danger"></i></button>');
        let newRow1 = cloneRow(serviceRow);

        generalTbody.find('tr').last().after(newRow);
        serviceTbody.find('tr').last().after(newRow1);

        onRowBootup(newRow);
        onRowBootup(newRow1);
        rowSno("#general-tbody");
        rowSno("#service-tbody");
    }

    function removeRow(options) {
        let eq = generalTbody.find(options.target).closest('tr').index();
        if (generalTbody.find('tr').length === 1) {
            /*generalRow = generalTbody.find('tr').eq(eq);
            serviceRow = serviceTbody.find('tr').eq(eq);*/
            newRow();
        }
        generalTbody.find('tr').eq(eq).remove();
        serviceTbody.find('tr').eq(eq).remove();
        rowSno("#general-tbody");
        rowSno("#service-tbody");
        callCalculation();
    }

    /*function for all calculations*/
    function callCalculation() {
        let debit = 0,
            credit = 0,
            addedAmount = 0,
            amount = 0,
            remain = 0,
            localAmount = 0,
            totalEnteredAmount = setAmount($("#total_amount").val()),
            rate = parseFloat($('#currency-rate').val());

        generalTbody.find('tr').each(function () {
            amount = setAmount($(this).find('td').find('input.amount').val());
            localAmount = rate * amount;
            addedAmount += amount;
            $(this).find('td').find('input.local_amount').val(localAmount);
            if (amount > 0) {
                debit += localAmount;
            } else if (amount < 0) {
                credit += localAmount;
            }
        });

        remain = (totalEnteredAmount + addedAmount).toFixed(fractionDigit);
        remainingAmount.val(remain);
        $('#debit').val(debit);
        $('#credit').val(credit);
        $('#total_local_amount').val(rate * totalEnteredAmount);
        toggleCloseButton(parseFloat(remain));
    }

    /*when change transaction type*/
    function callTransactionChange(transactionType) {
        let html = '',
            type = $(transactionType).val(),
            generalRow = $(transactionType).closest('tr'),
            transactionId = generalRow.find('td').find('select.transaction_id'),
            accounts = generalRow.find('td').find('select.accounts'),
            jobs = generalRow.find('td').find('select.jobs'),
            serviceRow = serviceTbody.find('tr').eq(generalRow.index()),
            description = serviceRow.find('td').find('select.description');

        generalRow.find('td').removeClass('error');
        accounts.prop('disabled', true).val('');
        description.prop('disabled', true).val('');
        jobs.prop('disabled', true).val('');
        transactionId.html('<option value="" data-hidden="true">Select</option>').removeAttr('disabled');
        if (type === '' || type === 'Bank Charges') {
            transactionId.prop('disabled', true);
        } else if (type === 'Customer') {
            html = $('#hide_customer').html();
            jobs.prop('disabled', false);
            transactionId.html(html);
        } else if (type === 'Supplier') {
            html = $('#hide_supplier').html();
            jobs.prop('disabled', false);
            transactionId.html(html);
        } else if (type === 'Project') {
            html = $('#hide_project').html();
            accounts.add(description).prop('disabled', false);
            transactionId.html(html);
        } else if (type === 'Job') {
            html = $('#hide_jobs').html();
            jobs.prop('disabled', false);
            jobs.html(html);
            html = $('#hide_descriptions').html();
            transactionId.html(html);
        } else if (type === 'Own Account') {
            html = $('#hide_employees').html();
            accounts.add(description).add(jobs).prop('disabled', false);
            transactionId.html(html);
            html = $('#hide_jobs').html();
            jobs.html(html);
        } else if (type === 'Truck') {
            html = $('#hide_trucks').html();
            transactionId.html(html);
        } else if (type === 'InputTax') {
            html = $('#hide_input_tax').html();
            transactionId.html(html);
        } else if (type === 'OutputTax') {
            html = $('#hide_output_tax').html();
            transactionId.html(html);
        }

        transactionType.focus();
        generalRow.find('select.selectpicker').not('.transaction_type').add(description).selectpicker('refresh');
    }

    /*when click match button*/
    function matchingDT() {
        let id = $("#hidden-party").val(),//encrypted party id
            type = $("#hidden-party-type").val(), // supplier or customer or truck
            matchingTable = $("#matching-table"), //the matching datatable
            columnsData = [], oAmount;

        if (type === 'Customer') {
            columnsData = [
                {orderable: false, searchable: false},
                {data: 'voucher_type', 'class': 'voucher_type'},
                {data: 'voucher_no', 'class': 'voucher_no'},
                {data: 'reference_no', 'class': 'reference_no'},
                {data: 'client_reference'},
                {data: 'cheque_no'},
                {data: 'job_no'},
                {data: 'voucher_date'},
                {data: 'currency'},
                {data: 'amount', 'class': 'local_amount text-right'},
                {data: 'local_amount', 'class': 'amount text-right'},
                {data: 'open_amount', 'class': 'open_amount form-group text-right'},
                {data: 'paid', 'class': 'pointer paid text-right'},
                {data: 'unpaid', 'class': 'pointer unpaid text-right'}
            ];
        } else if (type === 'Supplier') {
            columnsData = [
                {orderable: false, searchable: false},
                {data: 'voucher_type', 'class': 'voucher_type'},
                {data: 'voucher_no', 'class': 'voucher_no'},
                {data: 'reference_no', 'class': 'reference_no'},
                {data: 'cheque_no', 'class': 'invoice_no'},
                {data: 'client_reference', name: 'jobClientReference.client_reference'},
                {data: 'job_no'},
                {data: 'voucher_date'},
                {data: 'currency'},
                {data: 'amount', 'class': 'local_amount text-right'},
                {data: 'local_amount', 'class': 'amount text-right'},
                {data: 'open_amount', 'class': 'open_amount form-group text-right'},
                {data: 'paid', 'class': 'pointer paid text-right'},
                {data: 'unpaid', 'class': 'pointer unpaid text-right'}
            ];
        } else {
            columnsData = [
                {orderable: false, searchable: false},
                {data: 'voucher_type', 'class': 'voucher_type'},
                {data: 'party_no'},
                {data: 'voucher_no', 'class': 'voucher_no'},
                {data: 'reference_no', 'class': 'reference_no'},
                {data: 'client_reference'},
                {data: 'job_no'},
                {data: 'voucher_date'},
                {data: 'currency'},
                {data: 'amount', 'class': 'local_amount text-right'},
                {data: 'local_amount', 'class': 'amount text-right'},
                {data: 'open_amount', 'class': 'open_amount form-group text-right'},
                {data: 'paid', 'class': 'pointer paid text-right'},
                {data: 'unpaid', 'class': 'pointer unpaid text-right'}
            ];
        }

        let table = matchingTable.DataTable({
            ordering: false,
            ajax: {
                url: id + '/' + type + '/matching',
                type: 'POST'
            },
            columnDefs: [
                {  // check boxes
                    targets: [0], render: function (data, type, json) {
                        return '<div class="custom-control custom-checkbox">' +
                            '<input value="' + json.local_amount + '" data-row-id="' + json.id + '" type="checkbox" class="custom-control-input finance_id" id="F-' + json.id + '">' +
                            '<label class="custom-control-label pointer" for="F-' + json.id + '"></label>' +
                            '</div>';
                    }
                },
                {   //open amount
                    targets: [-3], render: function (data, type, json) {
                        oAmount = parseFloat(json.open_amount).toFixed(fractionDigit);
                        return '<input type="text" title="' + json.local_amount + '" ' + 'data-amount="' + oAmount + '" disabled ' + 'class="form-control received_amount currency text-right" ' + 'value="' + $.number(json.open_amount, fractionDigit) + '">';
                    }
                },
                {   //paid button
                    targets: [-2], render: function (data) {
                        return "<span class='badge badge-success pointer'>" + data + "</span>";
                    }
                },
                {   // unpaid button
                    targets: [-1], render: function (data) {
                        return "<span class='badge badge-danger pointer'>" + data + "</span>";
                    }
                }
            ],
            fnCreatedRow: function (row, data) {
                // This is for keeping already selected reference-checkbox to be enabled while searching
                if (data.id in matchObj) {
                    $(row).find('input.finance_id').prop('checked', true);
                    $(row).find('input.received_amount').val(matchObj[data.id]);
                }
                //for disable selecting zero open amount finance row
                if (data.open_amount === 0) {
                    $(row).find('input.finance_id').prop('disabled', true);
                }
            },
            fnDrawCallback: function (json) {
                let sumAmount = setAmount(json.jqXHR.responseJSON.balanceAmount),
                    matchingForm = $('#matching-form');

                $("#matching-table_filter").addClass('hide'); //hiding default DT search
                $('#balance_amount').val(sumAmount).number(true, fractionDigit);

                matching();
                initCurrency(matchingForm);
                inputMask(matchingForm);
            },
            columns: columnsData,
        });

        table.on('search.dt', function () {
            let searched = table.search(),
                allCheck = $("#allFinanceId");

            allCheck.prop('disabled', false);
            if (searched !== '')
                allCheck.prop('disabled', true);
        });

        matchingTable.find('thead tr:first th').not('.no').each(function () {
            let title = $(this).text();
            if (title !== '')
                $(this).html('<input type="text" class="form-control full-width" placeholder="' + title + '" />');
        });

        matchingTable.find('thead tr:first th input').on('keyup', function () {
            table.column($(this).parent().index() + ':visible').search(this.value).draw();
        });

        matchingTable.on('draw.dt', function () {
            matchingTable.find('tr td.paid,td.unpaid').on('click', function () {
                let tr = $(this).closest('tr'),
                    fId = tr.find('input.finance_id').data('row-id'),
                    refNo = tr.find('td.reference_no').text(),
                    amount = setAmount($(this).find('span').text()),
                    url = 'finance/voucher/payment/' + fId + '/finance/reference';
                if (amount !== 0)
                    getDataInModal(url, refNo || 'Payment Entries', viewVoucher, {size: 'medium', buttons: false});
                else
                    showToastr('No voucher', 'No voucher to show', {
                        type: 'info',
                        time: 2000,
                        position: 'toast-bottom-right'
                    });
            })
        });

    }

    /*when on DrawDtCallBack*/
    function matching() {
        let row = $("#row_reference").val(),
            tRow = $("#" + row),//  identifying matching tr
            checkBox = $("input.finance_id");

        initCheckBox();

        $("#backward").on('click', function () {
            $("#voucherBox").carousel('prev');
        });

        $("#allFinanceId").on('click', function () {
            $("input.finance_id").not(":disabled").prop('checked', $(this).is(':checked'));
            calculateMatching();
        });

        checkBox.on('click', function () {
            calculateMatching();
        });

        $(".received_amount").on('keyup', function () {
            calculateMatching();
        });

        //match submit button
        $('#matching').on('click', function () {
            let matchingAmount = 0,
                value = [],
                hasSearchEmpty = true;

            $("#matching-table").find('thead tr:first th input').each(function () {
                if ($(this).val() !== '') {
                    hasSearchEmpty = false;
                    return false;
                }
            });

            if (hasSearchEmpty) {
                if (validated()) {
                    for (let fId in matchObj) { // matchingObj{financeId:amount}
                        matchingAmount += matchObj[fId];
                        value.push(fId + '*' + matchObj[fId]);//pushing all match references
                    }
                    if (!jQuery.isEmptyObject(matchObj)) {
                        let tds = tRow.find('td'),
                            type = tds.find('select.transaction_type').val(),
                            matchingOppositeAmount = 0;

                        if (type === 'Supplier' || type === 'Truck') {
                            matchingOppositeAmount = matchingAmount
                        } else {
                            matchingOppositeAmount = getOppositeAmount(matchingAmount);
                        }
                        matchingOppositeAmount = parseFloat(matchingOppositeAmount).toFixed(fractionDigit);
                        tds.find('input.amount').prop('disabled', true).val(matchingOppositeAmount);
                        tds.find('input.voucher_reference_id').val(value); //match reference writing to dom
                        tds.find('select.transaction_id,select.transaction_type,select.jobs').prop('disabled', true).selectpicker('refresh');
                        callCalculation();
                        $("#voucherBox").carousel('prev');
                        $('button.close').removeClass('hide');
                    } else
                        showToastr('Error', 'You should check some entries', 'error');
                } else {
                    showToastr('Error', 'Amount entered greater than invoice amount', 'error');
                }
            } else {
                showToastr('Error', 'Please empty search box and make submit', 'error');
            }
        });

// pushing matched finance {id:amount} into match object and updating total match amount
        function calculateMatching() {
            setMatchingObject();
            setMatchingAmount();
        }

        function initCheckBox() {
            let refreshMatchingAmount = 0,
                referenceMatching = tRow.find('.voucher_reference_id').val();

            //getting match references and setting received amount, helps when click same match button for the second time
            if (referenceMatching !== '') {
                let split = referenceMatching.split(",");
                for (let k = 0; k < split.length; k++) {
                    let id = split[k].split("*"),
                        element = $("#F-" + id[0]);
                    element.prop({
                        checked: true,
                        disabled: true
                    });
                    element.closest('tr').find("td.open_amount input").val(id[1]).number(true, fractionDigit);// match amount
                    refreshMatchingAmount += parseFloat(id[1]).toFixed(fractionDigit);
                }
                $('#matching_amount').val(refreshMatchingAmount);
            }

            // payment voucher sub row iterating to disable checkbox that are already selected during another sub matching
            tRow.parent('tbody').find('tr').each(function () {
                let referenceValue = $(this).find('.voucher_reference_id').val();
                if (referenceValue !== '') {
                    let split = referenceValue.split(",");
                    for (let k = 0; k < split.length; k++) {
                        let id = split[k].split("*"),
                            element = $("#F-" + id[0]);// finance entry check box
                        element.prop({
                            checked: true,
                            disabled: true
                        });
                    }
                }
            });
        }

        function setMatchingObject() {
            let finId,
                amount = 0,
                pVoucherType = $("#voucher_type").val();

            checkBox.not(':disabled').each(function () {
                let closestTr = $(this).closest('tr'),
                    voucherType = closestTr.find('td.voucher_type').text().trim(),
                    openAmount = closestTr.find('td input.received_amount'),
                    originalAmount = parseFloat(openAmount.data('amount'));

                finId = $(this).data('row-id');//finance id

                if ($(this).is(':checked')) {
                    amount = setAmount(openAmount.val());
                    if ((voucherType === 'FI' || voucherType === 'SI' || voucherType === 'N' || voucherType === 'OB' || voucherType === 'GCI' || voucherType === 'GSI' || voucherType === 'TA' || voucherType === 'MA') && pVoucherType !== 'N') {
                        openAmount.prop('disabled', false);
                    }
                    matchObj[finId] = amount;    //update or set
                } else {
                    openAmount.val(originalAmount);
                    openAmount.prop('disabled', true).parent('td').removeClass('error');
                    delete matchObj[finId];
                }
            });
        }

        function setMatchingAmount() {
            let matchingAmount = 0;
            for (let fId in matchObj) {// calculating total matching amount
                matchingAmount += matchObj[fId];
            }
            $('#matching_amount').val(matchingAmount.toFixed(fractionDigit));// updating total matching amount
        }

        function validated() {
            let amount = 0, validated = true;
            checkBox.not(':disabled').each(function () {
                let closestTr = $(this).closest('tr'),
                    openAmount = closestTr.find('td input.received_amount'),
                    originalAmount = parseFloat(openAmount.data('amount'));

                if ($(this).is(':checked')) {
                    amount = setAmount(openAmount.val());
                    openAmount.parent('td').removeClass('error');

                    if (Math.abs(amount) > Math.abs(originalAmount)) {
                        validated = false;
                        openAmount.parent('td').removeClass('validate').addClass('error');
                    }
                }
            });
            return validated;
        }
    }
}


/* HS/Tariff Call */
function hsTariffCall() {
    let formId = $("#form"),
        invoiceTbody = $('#invoice-tbody');
    row = $("#invoice-row"),
        path = window.location.pathname,
        lastIndex = path.substr(path.lastIndexOf('/')),
        dtCall = (path == '/tariff/list');
    bindEvents();
    onBootup();

    //add dynamic row
    $('#addRow').off('click').on('click', function () {
        newRow();
    });
    //remove dynamic row
    invoiceTbody.find("button.dbRemoveSub").off('click').on('click', function () {
        let id = $(this).attr('data-id');
        if (id) {
            deleteData('tariff/' + id + '/sub/delete', $(this).closest('tr').find('td.local_amount').text(), remove, {
                target: $(this),
                callDt: false
            });
        } else
            remove({target: $(this)});
    });

    function remove(options) {
        invoiceTbody.find(options.target).closest('tr').remove();
        rowSno("#invoice-tbody");
        callCalculation();
    }

    $('#currency').on('change', function () {
        currencyConvert($(this).val(), callCalculation);
    });

    /* function for add new row*/
    function newRow(tabRow) {
        let newRow = cloneRow(row);
        newRow.find('td.description').html('');
        newRow.find('td.amount_view').html(0);
        newRow.find('td:last').html('<button type="button" name="" tabindex="-1" class="remove btn btn-default btn-round btn-sm"><i class="fa fa-minus text-danger"></i></button>');
        if (tabRow)
            invoiceTbody.find(tabRow).after(newRow);
        else
            invoiceTbody.find('tr').last().after(newRow);
        bindEvents();
        onRowBootup(newRow);
        rowSno("#invoice-tbody");
    }

    function bindEvents() {
        invoiceTbody.find(".remove").off('click').on('click', function () {
            remove({target: $(this)});
        });
        invoiceTbody.find(".quantity,.price").off('keyup').on('keyup', function () {
            $(this).closest('td').removeClass('has-error');
            callCalculation();
        });
        invoiceTbody.find(".hscode_id").on('change', function () {
            let duty = $(this).find('option:selected').data('duty');
            let description = $(this).find('option:selected').data('description');
            $(this).closest('tr').find('input.hidden-duty').val(duty);
            $(this).closest('tr').find('td.description').html(description);
            callCalculation();
        });
        formId.find("#currency-rate,#gross_amount").off('keyup').on('keyup', function () {
            $(this).closest('td').removeClass('has-error');
            callCalculation();
        });
        invoiceTbody.find(".price").on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 9) {
                var tabRow = $(this).closest('tr');
                newRow(tabRow);
            }
        });
    }

    /*Function for amount and total amount calculations*/
    function callCalculation(loRate) {
        let totalAmount = 0,
            totalLocalAmount = 0,
            tax = 0,
            taxAmount = 0,
            totalTaxAmount = 0,
            calculateEle, quantity, price, amount, localAmount,
            grossAmount = setAmount($('#gross_amount').val());
        let localRate = parseFloat((loRate) ? loRate : $('#currency-rate').val());

        invoiceTbody.find('tr').each(function () {
            calculateEle = $(this).find('td');
            tax = parseFloat($(this).find('select.hscode_id').find('option:selected').data('duty'));
            tax = isNaN(tax) ? 0 : tax;
            quantity = parseFloat(calculateEle.find('input.quantity').val());
            price = setAmount(calculateEle.find('input.price').val());
            amount = parseFloat((quantity * price).toFixed(fractionDigit));
            taxAmount = parseFloat((amount * (tax / 100)).toFixed(fractionDigit));
            localAmount = parseFloat((amount * localRate).toFixed(fractionDigit));
            $(this).find('td.amount').html(amount).number(true, fractionDigit);
            $(this).find('td.duty').html(tax + '%');
            $(this).find('td.duty_amount').html(taxAmount).number(true, fractionDigit).attr('title', amount + ' (' + tax + '%)');
            $(this).find('td.local_amount').html(localAmount).number(true, fractionDigit).attr('title', amount + ' * ' + localRate);
            totalAmount += amount;
            totalLocalAmount += localAmount;
            totalTaxAmount += parseFloat(taxAmount);
        });
        $("#total-tax-amount").val(totalTaxAmount).number(true, fractionDigit);
        $("#total-amount").val(totalAmount).number(true, fractionDigit);
        $("#total-local-amount").val(totalLocalAmount).number(true, fractionDigit);
        $('#remaining').val(grossAmount - parseFloat(totalAmount).toFixed(fractionDigit));
    }

    $("#submit").on('click', function (e) {
        e.preventDefault();
        let success = formId.valid(),
            check = true,
            url = formId.find("#data-url").val(),
            validEle, descriptionEle, unitEle, quantityEle, rateEle,
            grossAmount = parseFloat(setAmount($("#gross_amount").val())),
            totalAmount = parseFloat(setAmount($("#total-amount").val()));
        invoiceTbody.find("tr").each(function (i, el) {
            validEle = $(this).find('td');
            descriptionEle = validEle.find('select.hscode_id');
            unitEle = validEle.find('select.unit');
            quantityEle = validEle.find('input.quantity');
            rateEle = validEle.find('input.price');
            if (descriptionEle.val() == '') {
                descriptionEle.parent('td').addClass('has-error');
                check = false;
            }
            if (unitEle.val() == '') {
                unitEle.parent('td').addClass('has-error');
                check = false;
            }
            if (parseFloat(quantityEle.val()) == 0 || isNaN(parseFloat(quantityEle.val()))) {
                quantityEle.parent('td').addClass('has-error');
                check = false;
            }
            if (parseFloat(rateEle.val()) == 0 || isNaN(parseFloat(rateEle.val()))) {
                rateEle.parent('td').addClass('has-error');
                check = false;
            }
        });
        if (success && check) {
            if (grossAmount != 0) {
                if (grossAmount == totalAmount) {
                    sendData(url, hsTariffCall, {dataTable: dtCall});
                } else {
                    showToastr('Warning', 'Gross Amount and Total Amount should to be same', 'error');
                }
            } else {
                showToastr('Warning', 'Gross Amount should not be zero', 'error');
            }
        }
    });
}

/* Load Seaport / AirPort */

/*function portOnFocus(ele) {
    let modeVal = ele.data('mode'),
        modeType = $('#mode_type');
    if (modeVal) {
        let portSelect = ele.attr('id'),
            target = "#" + portSelect,
            airMode = modeType.val(),
            optionCount = ele.children('option').length,
            portChanged = false;

        if (modeVal !== airMode) {
            portChanged = true;
        }

        if (portChanged === true || optionCount < 4) {
            targetLoader(target);
            backgroundPostData('ports/load', {'type': airMode}, portValues, {mode: airMode, id: portSelect});
        }
    }
}

function portValues(data, options) {
    let polSelect = $('#pol'),
        podSelect = $('#pod'),
        length = data.length,
        podValue = podSelect.val(),
        polValue = polSelect.val();
    polSelect.html('');
    podSelect.html('');
    $.each(data, function (i, value) {
        let polOpt = document.createElement('option');
        polOpt.setAttribute('value', value);
        polOpt.setAttribute('data-subtext', i);
        if (value === polValue) {
            polOpt.setAttribute('selected', 'selected');
        }
        polOpt.innerHTML = value;
        polSelect.append(polOpt);

        let podOpt = document.createElement('option');
        podOpt.setAttribute('value', value);
        podOpt.setAttribute('data-subtext', i);
        if (value === podValue) {
            podOpt.setAttribute('selected', 'selected');
        }
        podOpt.innerHTML = value;
        podSelect.append(podOpt);
    });
    podSelect.data('mode', options.mode);
    polSelect.data('mode', options.mode);
    podSelect.selectpicker('refresh');
    polSelect.selectpicker('refresh');
}*/

function tabChange(tabId, form) {
    tabId = (tabId) ? tabId : 'nav-tabs';
    form = (form) ? form : 'form';
    $(document).on('keydown', function (e) {
        if (e.originalEvent.ctrlKey && (e.keyCode == 37 || e.keyCode == 39)) {
            let activeNav = $('#' + form).find("#" + tabId + " li.active"),
                nextNav = e.keyCode === 37 ? activeNav.prevAll('li').not('.disabled').first() : activeNav.nextAll('li').not('.disabled').first();
            nextNav.find('a').tab('show');
            $('#' + nextNav.data('key')).find('input:text:first:not(.datepicker)').focus();
        }
    });
}

/*
cs main js items  starts */

/* Quick Customer */
function quickCustomer() {
    let form = $('#quick-form');
    onBootup(form);
    $('.selectpicker').selectpicker('refresh');
    nameOtherKeyEvent($('#name'), $('#display-name'));
    $(function () {
        form.validate().settings.ignore = ':not(select:visible, input:visible, textarea:visible)';
    }),
        $('#quick-submit').on('click', function (e) {
            e.preventDefault();
            if (form.valid()) {
                let salesman = form.find('select#salesman-id').find('option:selected').data('salesman-name');
                sendData(getUrl() + 'quick_customer', appendQuickData, {
                    form: 'quick-form',
                    data: {'salesman_name': salesman}
                });
            }
        }),
        form.validate({
            rules: {
                name: {required: !0},
                email: {required: !0, email: !0},
                mobile: {required: !0}
            }, highlight: function (e) {
                $(e).closest('div').addClass('error');
            }, unhighlight: function (e) {
                $(e).closest('div').removeClass('error');
            }, errorPlacement: function (e, i) {
                i.closest('div').append(e);
            }, success: function (e) {
                $(e).closest('div').addClass('success'), $(e).closest('div').children('label.error').remove();
            }
        });

    form.find("#gst-treatment").on('change', function () {
        changeCustomerGstTreatment($(this).val(), $("#gst-no"), $("#state"));
    });
    form.find('#gst-no').on('focusout', function () {
        customerStateChange($(this), form);
    });
}

/* Quick Supplier */
function quickSupplier() {
    let form = $('#quick-form');
    onBootup(form);
    $('.selectpicker').selectpicker('refresh');
    form.find('#gst-treatment').on('change', function () {
        let treatmentVal = $(this).find('option:selected').val();
        supplierTreatmentChange(treatmentVal, form)
    });
    form.find('#gst-no').on('focusout', function () {
        let gstNo = $(this).val();
        let stateCode = gstNo.slice(0, 2);
        if (statesMethod(stateCode, true)) {
            form.find('#state').val(stateCode).selectpicker('refresh');
        }

    });
    $(function () {
        form.validate().settings.ignore = ":not(select:hidden, input:visible, textarea:visible)"
    }), $("#quick-submit").on("click", function (e) {
        e.preventDefault();
        if (form.valid())
            sendData(getUrl() + "quick_supplier", appendQuickData, {form: "quick-form"});
    }),
        form.validate({
            rules: {name: {required: !0}, email: {required: !0, email: !0}, mobile: {required: !0}},
            highlight: function (e) {
                $(e).closest("div").addClass("error")
            },
            unhighlight: function (e) {
                $(e).closest("div").removeClass("error")
            },
            errorPlacement: function (e, i) {
                i.closest("div").append(e)
            },
            success: function (e) {
                $(e).closest("div").addClass("success"), $(e).closest("div").children("label.error").remove()
            }
        })
}

/*Quick Sales*/
function quickSalesman() {

    let form = $('#quick-form'),
        employee = form.find('select#employee-id'),
        vendor = form.find('#vendor');

    onBootup(form);

    $('#type').on('change', function () {
        let val = $(this).val();
        employee.add(vendor).prop('disabled', true);
        if (val === 'Employee') {
            employee.prop('disabled', false);
            vendor.val('');
        } else if (val === 'Vendor') {
            vendor.prop('disabled', false);
            employee.val('');
        }
        employee.selectpicker('refresh');
    });

    $('.selectpicker').selectpicker('refresh');

    $("#quick-submit").on("click", function (e) {
        e.preventDefault();
        if (form.valid())
            sendData(getUrl() + "quick_salesman", appendQuickData, {form: "quick-form", closeModal: 1});
    });
}

/* Quick Prospect */
function quickProspect() {
    let form = $('#quick-form');
    onBootup(form);
    $('.selectpicker').selectpicker('refresh');
    $(function () {
        form.validate().settings.ignore = ':not(select:hidden, input:visible, textarea:visible)';
    }),
        $('#quick-submit').on('click', function (e) {
            e.preventDefault();
            if (form.valid()) {
                let salesman = form.find('select#salesman-id').find('option:selected').data('salesman-name');
                sendData(getUrl() + 'quick_prospect', appendQuickData, {
                    form: 'quick-form',
                    data: {'salesman_name': salesman}
                });
            }
        }),
        form.validate({
            rules: {
                name: {required: !0},
                email: {required: !0, email: !0},
                mobile: {required: !0}
            }, highlight: function (e) {
                $(e).closest('div').addClass('error');
            }, unhighlight: function (e) {
                $(e).closest('div').removeClass('error');
            }, errorPlacement: function (e, i) {
                i.closest('div').append(e);
            }, success: function (e) {
                $(e).closest('div').addClass('success'), $(e).closest('div').children('label.error').remove();
            }
        });
}

function appendQuickData(data) {

    let opt = document.createElement('option');
    opt.setAttribute('value', data.data.id);
    opt.setAttribute('data-subtext', data.data.row_no);
    opt.setAttribute('data-salesman-id', data.data.salesman);
    opt.setAttribute('data-salesman-name', data.data.salesman_name);
    if (data.data.treatment) {
        opt.setAttribute('data-state', data.data.state);
        opt.setAttribute('data-treatment', data.data.treatment);
        opt.setAttribute('data-gst', data.data.gst_no);
    }
    opt.innerHTML = data.data.name;
    let ele = $('#' + data.data.target);
    ele.find('option[value=""]:last').after(opt);
    ele.val(data.data.id);
    ele.selectpicker('refresh');
    ele.trigger('change');
    let salesman = $('#' + data.data.salesman_target);
    if (salesman.length) {
        salesman.val(data.data.salesman);
        salesman.selectpicker('refresh');
    }
}

function customerStateChange(gstNumber, form) {
    let gstNo = gstNumber.val();
    let stateCode = gstNo.slice(0, 2);
    if (statesMethod(stateCode, true)) {
        form.find('#state').val(stateCode).selectpicker('refresh');
    }
}

/*Action Menu**/

$('div.action-menu').on('click', function () {
    let url = $(this).data('url'),
        title = $(this).find('span').text();
    getDataInModal('event/' + url, title, actionMenuCall, {button: false});

    function actionMenuCall() {
        dataTables(0);
        $('#action-tabs').find('a.nav-link').on('click', function () {
            $("a").removeClass("active");
            $(this).addClass("active");
            let tab = $(this).data('id');
            dataTables(tab);
        });
    }

    function dataTables(tab) {


        let datatable, grp, rowNo, col3, col4, col5, col6, cClass, columnArray, pearson = 'customer', subtitle, preUrl,
            rowGrp,
            colDefArray = [
                {
                    targets: [2], render: function (col, type, row) { // customer
                        let pearsonData = row.supplier;
                        pearson = 'supplier';
                        if (pearsonData === undefined) {
                            pearsonData = row.customer;
                            pearson = 'customer';
                        }
                        return pearsonData.row_no + '<br><small class=" subtext">' + pearsonData.name + '</small>';
                    },
                },
                {
                    targets: [3], render: function (col, type, row) { // job

                        return row.job ? row.job.row_no : '';
                    },
                },
            ], colDefArray2 = [
                {
                    targets: [-1], render: function (col, type, row) {

                        return "<button class='btn btn-sm action_button  btn-primary' data-url='" + preUrl + row.data + "'>Go To invoice</button>";
                    },
                },
            ];

        tab = (tab === undefined) ? $('#action-tabs').find('a.nav-link.active').data('id') : tab;
        switch (title) {
            case 'Pending Invoices':
                grp = 1;
                datatable = $('#pending-invoices');
                if (tab === 0) {
                    pearson = 'supplier';
                    preUrl = '/invoice/supplier/list/';
                    subtitle = 'Supplier Invoice';
                    col4 = 'row_no';
                    col5 = 'total_amount';
                    col6 = 'total_local_amount';
                    $('.c5').text('Amount');
                    $('.c6').text('Local Amount');
                    $('.c2').text('Supplier');
                } else if (tab === 1) {
                    preUrl = '/invoice/cost/list/';
                    subtitle = 'Cost Sheet';
                    col4 = 'row_no';
                    col5 = 'currency';
                    col6 = 'total_revenue_amount';
                    $('.c2').text('Customer');
                    $('.c5').text('Currency');
                    $('.c6').text('Total Revenue');
                }
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: pearson + '.row_no', name: pearson + '.row_no'},
                    {data: 'job.row_no',},
                    {data: col4},
                    {data: col5, 'class': 'amount-view'},
                    {data: col6, 'class': 'amount-view'},
                    {data: 'posting_date',},
                    {data: 'data', 'class': 'data_id', searchable: false, orderable: false},
                ];
                break;
            case 'Invoice Approvals':
                grp = 1;
                datatable = $('#invoice-approvals');
                cClass = 'hide';
                $('.c2').text('Customer');
                if (tab === 0) {
                    pearson = 'supplier';
                    preUrl = '/invoice/supplier/list/';
                    col4 = 'row_no';
                    col5 = 'total_amount';
                    col6 = 'total_local_amount';
                    $('.c2').text('Supplier');
                    $('.c5').text('Amount');
                    $('.c6').text('Local Amount');
                } else if (tab === 1) {
                    preUrl = '/invoice/cost/list/';
                    col4 = 'row_no';
                    col5 = 'currency';
                    col6 = 'total_revenue_amount';
                    $('.c5').text('Currency');
                    $('.c6').text('Total Revenue');
                } else if (tab === 2) {
                    preUrl = '/invoice/final/list/';
                    col4 = 'row_no';
                    col5 = 'currency';
                    col6 = 'total_amount';
                    $('.c5').text('Currency');
                    $('.c6').text('Amount');
                }
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: pearson + '.row_no', name: pearson + '.row_no'},
                    {data: 'job.row_no',},
                    {data: col4},
                    {data: col5, 'class': 'amount-view'},
                    {data: col6, 'class': 'amount-view'},
                    {data: 'posting_date'},
                    {data: 'data', 'class': 'data_id', searchable: false, orderable: false},
                ];
                break;
            case 'Pre Invoices':
                grp = 1;
                datatable = $('#pre-invoice');
                preUrl = '/invoice/supplier/list/';
                pearson = 'supplier';
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: 'supplier.row_no', name: 'supplier.row_no'},
                    {data: 'job.row_no',},
                    {data: 'row_no',},
                    {data: 'pre_invoice_no',},
                    {data: 'total_amount', 'class': 'amount-view'},
                    {data: 'total_local_amount', 'class': 'amount-view'},
                    {data: 'data', 'class': 'data_id', searchable: false, orderable: false},
                ];
                break;
            case 'OS Invoices':
                let person;
                datatable = $('#os-invoice');
                colDefArray2 = [];
                if (tab === 0) {
                    grp = 1;
                    $('#person').text('Customer');
                    person = 'customer.name';
                } else if (tab === 1) {
                    $('#person').text('Supplier');
                    person = 'supplier.name';
                    colDefArray = [
                        {
                            targets: [2], render: function (col, type, row) { // supplier

                                return row.supplier.row_no + '<br><small class=" subtext">' + row.supplier.name + '</small>';
                            },
                        },
                    ];
                    rowGrp = {
                        dataSrc: person,
                        endRender: function (rows) {
                            let nodes = rows.nodes();
                            let nLength = nodes.length;
                            let index = nLength - 1;
                            $(nodes).eq(index);
                        }
                    };
                }
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: person},
                    {data: 'reference_no'},
                    {data: 'job_no'},
                    {data: 'amount', 'class': 'amount-view'},
                    {data: 'local_amount', 'class': 'amount-view'},
                    {data: 'voucher_date'},
                ];
                break;
            case 'Overdue Invoices':
                grp = 1;
                datatable = $('#overdue-invoices');
                colDefArray2 = [
                    {
                        targets: [-1], render: function (data) {       //due date column
                            return data.due + '<br> ' +
                                ' <small class="text-danger">' + data.msg + '</small> ';
                        }
                    },
                ];
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: 'customer.name'},
                    {data: 'job.row_no'},
                    {data: 'row_no'},
                    {data: 'total_amount', 'class': 'amount-view'},
                    {data: 'posting_date'},
                    {data: 'due_date'}
                ];
                break;
            case 'Invoice Dispatches':
                grp = 1;
                url = 'dispatch/list';
                datatable = $('#invoice-dispatch');
                cClass = '';
                colDefArray2 = [];
                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'id', visible: false},
                    {data: 'customer.name',},
                    {data: 'job.row_no',},
                    {data: 'row_no',},
                    {data: 'total_sum',},
                    {data: 'posting_date',},
                ];
                break;
            case 'Voucher Approvals':
                datatable = $('#voucher-approvals');
                cClass = '';
                colDefArray = [];
                colDefArray2 = [];
                rowGrp = '';
                if (tab === 0) {
                    preUrl = '/finance/voucher/payment/list/';
                    subtitle = 'Payment Voucher';
                    cClass = 'amount-view';
                    col3 = 'total_amount';
                    col4 = 'total_local_amount';
                    $('.c3').text('Amount');
                    $('.c4').text('Local Amount');

                } else if (tab === 1) {
                    preUrl = '/finance/voucher/internal/lst/';
                    subtitle = 'Internal Voucher';
                    cClass = 'amount-view';
                    col3 = 'debit';
                    col4 = 'credit';
                    $('.c3').text('Debit');
                    $('.c4').text('Credit');
                } else if (tab === 2) {
                    preUrl = '/finance/voucher/transfer/list/';
                    subtitle = 'Transfer Voucher';
                    col3 = 'from_account';
                    col4 = 'to_account';
                    $('.c3').text('From Account').removeClass('amount-view');
                    $('.c4').text('To Account').removeClass('amount-view');
                }

                columnArray = [
                    {data: 'DT_RowIndex', orderable: false},
                    {data: 'row_no',},
                    {data: 'id', visible: false},
                    {data: col3, 'class': cClass},
                    {data: col4, 'class': cClass},
                    {data: 'posting_date',},

                ];
                break;
        }
        if (grp === 1) {
            rowGrp = {
                dataSrc: pearson + '.name',
                endRender: function (rows) {
                    let nodes = rows.nodes();
                    let nLength = nodes.length;
                    let index = nLength - 1;
                    $(nodes).eq(index);
                }
            };
        }
        colDefArray = colDefArray.concat(colDefArray2);
        let dT = datatable.DataTable({
            order: [[2, 'asc']],
            ajax: getAjax('/event/' + url, {'type': tab}),
            columnDefs: colDefArray.concat([
                {targets: [0, 1], searchable: false},
            ]),
            rowGroup: rowGrp,
            columns: columnArray,
            buttons: dataTableExportButtons(title, {refreshCallBack: dataTables}),
        });
        datatable.on('draw.dt', function () {
            if ($(this).attr('id') === 'overdue-invoices') {
                $(this).find('tbody tr ').off('dblclick').on("dblclick", function (e) {
                    e.preventDefault();
                    let id = $(this).data('id');
                    window.open('/invoice/final/' + id + '/normal/print')

                });
            }
            datatable.find('.action_button').on('click', function () {
                preUrl = $(this).data('url');
                window.open(preUrl);
            });
        })
    }
});

/* Keyboard Events */
jwerty.key('ctrl+alt+n', function (e) {
    e.preventDefault();
    $("#new").click();
});

jwerty.key('ctrl+alt+/', function (e) {
    e.preventDefault();
    getDataInModal('features/keyboard_helpers', 'Keyboard Shortcuts', false, {buttons: false, size: 'medium'});
});

//Customer
jwerty.key('ctrl+alt+c', function (e) {
    e.preventDefault();
    getDataInModal('customer/create', 'Customer', customerCall);
});

//Customer List
jwerty.key('ctrl+shift+c', function (e) {
    e.preventDefault();
    window.location.href = getUrl() + 'customer/list';
});

//Customer details
jwerty.key('shift+alt+c', function (e) {
    e.preventDefault();
    window.location.href = getUrl() + 'customer/details';
});

//Supplier
jwerty.key('ctrl+alt+s', function (e) {
    e.preventDefault();
    getDataInModal('supplier/create', 'Supplier', supplierCall);
});

//Supplier list
jwerty.key('ctrl+shift+s', function (e) {
    e.preventDefault();
    window.location.href = getUrl() + 'supplier/list';
});

//Supplier details
jwerty.key('shift+alt+s', function (e) {
    e.preventDefault();
    window.location.href = getUrl() + 'supplier/details';
});

//Job
jwerty.key('ctrl+alt+j', function (e) {
    e.preventDefault();
    let btn = '<button class="btn btn-raised btn-outline-primary" id="navInvoice" type="button">Submit &amp; Go to Invoice</button>';
    getDataInModal('job/create', 'Job', jobCall, {customButtons: btn, size: 'full'});
});
// //Quotation
// jwerty.key('ctrl+alt+q', function (e) {
//     e.preventDefault();
//     getDataInModal('sales/quotation/create', 'Quotation', quotationCall, {size: 'full'});
// });
//
// //Quotation List
// jwerty.key('ctrl+shift+q', function (e) {
//     e.preventDefault();
//     window.open('/sales/quotation/list', '_blank');
// });

//Payment Voucher Call
jwerty.key('ctrl+alt+p', function (e) {
    e.preventDefault();
    getDataInModal('finance/voucher/payment/create', 'Payment Voucher', paymentVoucherCall, {size: 'full'});
});

//Modal Save
jwerty.key('ctrl+s', function (e) {
    e.preventDefault();
    $('#submit').trigger('click')
});
//Change modal tab
jwerty.key('shift+`', function (e) {
    e.preventDefault();
    let ul = $('ul.nav-tabs:visible').last(),
        anchor = ul.find('a.active').closest('li').next().find('a');
    if (anchor.length) {
        if (!anchor.hasClass('disabled'))
            anchor.trigger('click');
        else {
            ul.find('a.active').closest('li').nextAll().filter(':not(:has(a.disabled))').first().find('a').trigger('click');
        }
    } else {
        ul.find('a:first').trigger('click');
    }
});

