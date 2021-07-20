let hostName = window.location.origin, body = $('body'), form, docurl = document.URL, filterForm = $('#form-filter'),
    locale = $("html").attr('lang'), page, firstSegment, subDomain, companyFlag = true, initialForm;
const CSRF = $('meta[name="csrf-token"]').attr('content');
let pos1 = docurl.indexOf('/', hostName.length) + 1;
if (docurl.includes('list')) {
    trim = docurl.lastIndexOf('list');
    page = docurl.substring(pos1, trim + 4);
} else {
    page = docurl.substring(pos1);
}
page = replaceAll('/', '_', page);
subDomain = hostName.substring((window.location.protocol).length + 2, hostName.indexOf('.'));
firstSegment = page.substring(0, page.indexOf('_'));
let rx = /^[a-z_]+$/;
if (!(!rx.test(page))) {
    let menu = $("#menu_" + page);
    if (menu.length > 0) {
        menu.parent('li').addClass('active');
        let toggleAttr = navToggle.find('.toggle-icon').data('toggle');
        if (toggleAttr == 'expanded')
            menu.closest('li.nav-item').removeClass('nav-collapsed-open').addClass('open');
        else
            menu.closest('li.nav-item').removeClass('open').addClass('nav-collapsed-open');
    }
}

let fractionDigit,TAXES={};
$(function () {
    if (localStorage.getItem('layout') === 'dark') {
        $('#body').addClass('layout-dark');
    }
    getFractionDigit();
    getTaxes();
});

/*$('.indexing-text').off('mouseenter').on('mouseenter', function () {
    let id = $(this).data('id');
    let url = getUrl() + 'invoice/' + $(this).data('url') + '/' + id + '/normal/print';
    $('#indexing-preview').load(url);
});*/

/* on click redirecting with selected */
function globalSearch(table, searchButton, baseUrl, tab = '') {
    let urlValues = new URLSearchParams(window.location.search);
    let q = urlValues.get('q'),
        searchDate = urlValues.get('searchDate'),
        status = urlValues.get('status');
    if (searchDate) {
        window.history.pushState({}, document.title, "/" + baseUrl + "/list?q=" + q);
        console.log(q, searchButton);
        if (searchButton) {
            $("#from-date").val(searchDate);
            $("#to-date").val(searchDate);

            searchButton.trigger('click');
        }
    }
    if (q && tab === 'all') {
        $('#all').trigger("click");
    } else if (tab !== '' && status) {
        $('#' + status).trigger("click");
    }
    if (q) {
        q = q.split("-")[0];
        window.history.pushState({}, document.title, "/" + baseUrl + "/list");
        table.search(q).draw();
    }


}


function __(str) {
    if (locale === 'en')
        return str;
    return (AR_TRANSLATE[str]) ? AR_TRANSLATE[str] : str;
}

//Helpers

// Locale based configurations
let dTLanguage = '', toastrRTL = false;
$.fn.selectpicker.defaults = {
    title: 'Select',
    liveSearchPlaceholder: 'Type to search',
    selectOnTab: true
};
// For Datatable
if (locale === 'ar') {
    dTLanguage = {
        "sEmptyTable": "ليست هناك بيانات متاحة في الجدول",
        "sLoadingRecords": "جارٍ التحميل...",
        "sProcessing": "جارٍ التحميل...",
        "sLengthMenu": "أظهر _MENU_ مدخلات",
        "sZeroRecords": "لم يعثر على أية سجلات",
        "sInfo": "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
        "sInfoEmpty": "يعرض 0 إلى 0 من أصل 0 سجل",
        "sInfoFiltered": "(منتقاة من مجموع _MAX_ مُدخل)",
        "sInfoPostFix": "",
        "sSearch": "ابحث:",
        "sUrl": "",
        "oPaginate": {
            "sFirst": "الأول",
            "sPrevious": "السابق",
            "sNext": "التالي",
            "sLast": "الأخير"
        },
        "oAria": {
            "sSortAscending": ": تفعيل لترتيب العمود تصاعدياً",
            "sSortDescending": ": تفعيل لترتيب العمود تنازلياً"
        }
    };

    // Selectpicker Defaults
    (function ($) {
        $.fn.selectpicker.defaults = {
            noneSelectedText: 'لم يتم إختيار شئ',
            noneResultsText: 'لا توجد نتائج مطابقة لـ {0}',
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? '{0} خيار تم إختياره' : '{0} خيارات تمت إختيارها';
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? 'تخطى الحد المسموح ({n} خيار بحد أقصى)' : 'تخطى الحد المسموح ({n} خيارات بحد أقصى)',
                    (numGroup == 1) ? 'تخطى الحد المسموح للمجموعة ({n} خيار بحد أقصى)' : 'تخطى الحد المسموح للمجموعة ({n} خيارات بحد أقصى)'
                ];
            },
            selectAllText: 'إختيار الجميع',
            deselectAllText: 'إلغاء إختيار الجميع',
            multipleSeparator: '، ',
            liveSearchPlaceholder: 'اكتب للبحث',
            title: 'تحديد'
        };
    })(jQuery);
    // Datepicker Defaults
    !function (a) {
        a.fn.datepicker.dates.ar = {
            days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
            daysShort: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"],
            daysMin: ["ح", "ن", "ث", "ع", "خ", "ج", "س", "ح"],
            months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
            monthsShort: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
            today: "هذا اليوم",
            rtl: !0
        }
    }(jQuery);
    $.fn.datepicker.defaults.language = 'ar';
    toastrRTL = true;
}
// Lcoale Configurations End

// Trigger bootup fn on page load done
filterForm = filterForm.length ? filterForm : $("#form:last");
onBootup(filterForm);
setFilterCount();
matchHeight();


/*$("#content-wrapper").slimScroll({
    height: '90vh'
});*/
// Ajax Setup will append every ajax call
$.ajaxSetup({
    headers: {
        'X-CSRF-Token': $('meta[name = "csrf-token"]').attr('content')
    },
    statusCode: {
        401: function () {
            window.location.reload();
        },
        419: function () {
            window.location.reload();
        },
        488: function (xhr) {
            destroyLoaders();
            alertBox('ERROR');
        }
    }
});

/*APP URL*/
function getUrl() {
    return hostName + '/';
}

function getFullUrl() {
    return window.location.href;
}

/*APP URL END*/

/*REPLACE AND REVERSE*/
function replaceAll(find, replace, str, defaultValue) {
    if (typeof str == 'number' || !str.includes(find))
        return (defaultValue) ? defaultValue : str;
    return str.replace(new RegExp(find, 'g'), replace);
}

function reverseAll(str, find, replace) {
    return str.split(find).reverse().join(replace);
}

// Will convert string to amount
function setAmount(amount) {
    if (typeof amount === "undefined" || amount.length === 0)
        return 0;
    amount = amount.toString();
    return parseFloat(amount.replace(/,/g, ''));
}

/*OPPOSITE AMOUNT*/
function getOppositeAmount(amount) {
    amount = parseFloat(amount);
    return amount * -1;
}

function removeElements(options) {
    if (options.id)
        $("#form").find('#' + options.id).remove();
    if (options.className)
        $("#form").find("." + options.className).remove();
}

function random(random) {
    random = (random) ? random : 100;
    return Math.floor((Math.random() * parseInt(random)) + 1);
}

function today() {
    let d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let fullDate = (day < 10 ? '0' : '') + day + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        d.getFullYear();
    return fullDate;
}

function pageReload() {
    window.location.reload();
}

/* For typeahead */
function setTypeahead() {
    let set = [], typeahead = $(".typeahead");
    typeahead.each(function (i, e) {
        set[i] = {
            "model": $(this).data('model'),
            "field": $(this).data('field'),
            "id": $(this).attr('id')
        };
    });
    $.ajax({
        url: '/typeahead',
        type: 'POST',
        data: {set},
        success: function (response) {
            for (let res in response) {
                $("#" + res).typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1,
                    source: response[res],
                    items: 6,
                    autoSelect: false,
                    fitToElement: true,
                })
            }
        }
    });
}

/* New Tab */
function newTab(url, params) {
    let q = '', p;
    if (params) {
        q += '?';
        for (p in params) {
            q += p + '=' + params[p] + '&';
        }
        q = q.substr(0, q.lastIndexOf('&'));
    }
    window.open(url + encodeURI(q));
}

/* For error in tabs */
function errorTabs(form) {
    let aTab = form.find("#nav-tabs li"), id, count;
    aTab.find('a').removeClass('text-danger');

    aTab.find('a').each(function () {
        id = $(this).attr('href');
        id = id.substr(1);
        count = $("#" + id).find('div.error,td.error').length;
        if (count > 0)
            $(this).addClass('text-danger');
    });
}

// Appending Serial No every row
function rowSno(tbodyName, draggableIcon) {
    let icon = (draggableIcon) ? 'draggable-icon' : '';
    let elements, name, s;
    $(tbodyName).find('tr').each(function (k) {
        $(this).find('td:first').html((k + 1)).addClass(icon);
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

// Cloning existing row
function cloneRow(row) {
    let newRow = row.clone();
    newRow.removeAttr('id');
    newRow.find('.bootstrap-select').each(function () {
        $(this).find('button,div,option.bs-title-option').remove();
        let h = $(this).html();
        $(this).closest('td').html(h);
    });
    newRow.find('input,textarea,select').val('');
    newRow.find('input.numeric').val(0);
    newRow.find('td.cell-amount').text(0.00);
    return newRow;
}

// Getting currency value from resource
function currencyConvert(currency, callBack, target) {
    target = (target) ? target : "#currency-rate";
    targetLoader(target);
    $.ajax({
        url: getUrl() + 'currency/' + currency,
        type: 'GET',
        success: function (res) {
            destroyTargetLoader();
            let rate = parseFloat(res).toFixed(3);
            $(target).val(rate);
            callBack(rate);
        }
    })
}

function errorMessage(err, alert) {
    destroyLoaders();
    let message = err.responseText, title = 'Error';
    if (err.responseJSON) {
        message = err.responseJSON.message;
        title = err.responseJSON.title || title;
    }
    if (alert === 'alert')
        errorBox({title: title, text: message});
    else
        showToastr(title, message, 'error');
    return false;
}

// Approved effect function
function approvedEffect(response, options) {
    let rowTd = options.column;
    if (rowTd.hasClass('text-success') && response.data['status'] == 1) {
        rowTd.removeClass('text-success').addClass('text-danger');
    } else {
        rowTd.removeClass('text-danger').addClass('text-success');
    }
}

// Helpers End

/* LOADERS SECTION */
// Loading when submit button clicks
// Initiate Loaders
function btnLoader(btnId) {
    $('#' + btnId).attr('disabled', true).addClass('ld-ext-right running').text('Saving...').append('<span class="ld ld-ring ld-spin-fast"></span>');
}

// Loader for element
function loader(element) {
    let ele = "body";
    let className = "ld-over-full";
    if (element) {
        ele = element;
        className = "loading-io ld-over";
    }
    $(ele).append('<div class="loader-overlay panel-body ' + className + ' running font-large-1"><div class="ld ld-ball ld-bounce text-primary"></div></div>');
}

// Progress Loader
function progressLoader() {
    return '<div class="progress-section"><div class="progress"><div id="progress-bar-loader" class="progress-bar" role="progressbar" data-progress="0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div></div><div class="mt-2"><small id="progress-bar-loading-percentage"></small></div></div>';
}

// Target Loader
function targetLoader(id) {
    destroyTargetLoader();
    let target = $(id);
    let className = 'has-icon-right';
    if (target.hasClass('number'))
        className = 'has-icon-left';
    //target.closest('.form-group').addClass(className);
    target.closest('.form-group').append("<div class='form-control-position target-loader' style='top: 0;right:10px'><i class='ft-loader spinner'></i></div>")
}

// Stick Loader
function stickLoader(title, msg, loader) {
    title = (title) ? title : 'Loading';
    let hide = (loader) ? '' : 'hide';
    msg = (msg) ? msg : 'Processing Data';
    $(".stick-loader").remove();
    $("body").append('<div class="stick-loader animated fadeIn"><div class="stick-section"><h5 class="stick-title mb-1">' + title + '</h5><p class="stick-description">' + msg + '</p><div id="stick-progress" class="mt-2 mb-1 ' + hide + '"><div class="progress progress-mini"><div id="progress-bar-loader" class="progress-bar" role="progressbar" data-progress="0" aria-valuenow="0" aria-valuemin="0" style="width: 0%"></div> </div>\n' +
        '<small id="progress-bar-loading-percentage">0</small></div></div></div>');
}

function randomLoader(target) {
    let s = getUrl() + 'img/loader-' + random(5) + '.gif';
    target.html('<div class="d-flex flex-wrap align-content-center h-100 random-loader">\n' +
        '        <img src="' + s + '" class="img-fluid">\n' +
        '    </div>');
}

function tableLoader(target, loop) {
    loop = loop ?loop: 5;
    let l = "<table class='loader-table'><tbody>";
    for (i = 0; i < 10; i++) {
        l += '<tr>';
        for (k = 0; k < loop; k++) {
            l += '<td class="loading"><div class="bar"></div></td>';
        }
        l += '</tr>';
    }
    l += "</tbody></table>";
    $('#' + target).html(l);
}

// Destroy Loaders
//Remove Btn Loaer
function destroyBtnLoader() {
    $('.ld-ext-right').removeAttr('disabled').removeClass('ld-ext-right running').text('Save');
}

// Destroy loader
function destroyLoader() {
    $(".loader-overlay").remove();
}

// Destroy target loader
function destroyTargetLoader() {
    $(".target-loader").remove();
}

// Destroy stick loader
function destroyStickLoader() {
    $(".stick-loader").addClass('fadeOut');
    setTimeout(function () {
        $('.stick-loader').remove();
    }, 1000);
}

//Destory Random Loader
function destroyRandomLoader() {
    $('.random-loader').remove();
}

function destroyTableLoader(id) {
    document.getElementById(id).innerHTML = '';
}

// Destroy All loaders
function destroyLoaders() {
    destroyBtnLoader();
    destroyLoader();
    destroyTargetLoader();
    destroyStickLoader();
    destroyRandomLoader();
}

/* LOADERS SECTION END */

/* Jquery confirm Initialization */

/* Alert Box*/
function alertBox(title, options) {
    let defaults = {
        timer: 0,
        type: false,
        text: 'Successfully Processed',
        animation: 'top',
        icon: false,
    };
    (typeof options === 'object')
        ? jQuery.extend(defaults, options)
        : defaults.text = options;
    if (defaults.type === 'red') {
        defaults.icon = 'fa fa-exclamation-triangle';
    }
    let timer = (defaults.timer) ? 'confirm|' + defaults.timer : false;
    $.alert({
        title: title,
        content: defaults.text,
        type: defaults.type,
        closeIcon: true,
        bgOpacity: 0.5,
        autoClose: timer,
        icon: defaults.icon,
        animateFromElement: false,
        typeAnimated: true,
        buttons: {
            confirm: {
                text: 'Ok',
                btnClass: 'btn-primary',
            },
        },
    });
}

/*Confirm Box*/
function confirmBox(options, data) {
    let defaults = {
        title: 'Hello',
        text: 'Are you sure to continue?',
        type: 'red',
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        cancelCallBack: false,
        confirmCallBack: false,
        confirmClass: 'btn-primary'
    };
    (typeof options === 'object')
        ? jQuery.extend(defaults, options)
        : defaults.confirmCallBack = options;
    $.confirm({
            title: defaults.title,
            content: defaults.text,
            type: defaults.type,
            animateFromElement: false,
            buttons: {
                cancel: {
                    text: defaults.cancelButtonText,
                    btnClass: 'btn-default btn-flat',
                    action: function () {
                        if (defaults.cancelCallBack) {
                            defaults.cancelCallBack();
                        }
                    },
                },
                confirm: {
                    text: defaults.confirmButtonText,
                    btnClass: defaults.confirmClass,
                    action: function () {
                        if (defaults.confirmCallBack) {
                            defaults.confirmCallBack(data);
                        }
                    },
                },
            },
        },
    );
}

/* Error Box */
function errorBox(options) {
    let defaults = {
        type: 'red',
        text: 'Something went wrong while processing..',
        title: 'Error',
        icon: 'fa fa-exclamation-triangle'
    };
    if (typeof options === "object")
        jQuery.extend(defaults, options);
    else if (typeof options == 'string')
        defaults.text = options;
    $.alert({
        title: defaults.title,
        content: defaults.text,
        type: defaults.type,
        animation: 'zoom',
        animateFromElement: false,
        closeIcon: true,
        bgOpacity: 0.5,
        icon: defaults.icon,
        typeAnimated: true,
        buttons: {
            confirm: {
                text: 'Ok',
                btnClass: 'btn-primary',
            }
        }
    });
}

// Toaster Initialization
function showToastr(title, msg, options) {
    let defaults = {
        type: 'success',
        time: 5000,
        position: 'toast-bottom-left animated bounceInUp',
        url: false,
    };
    (typeof options === "object") ? jQuery.extend(defaults, options) : defaults.type = options || 'success';
    if (defaults.type === 'info')
        defaults.position = 'toast-top-right animated bounceInRight'
    toastr.options = {
        closeButton: true,
        progressBar: false,
        preventDuplicates: true,
        positionClass: defaults.position,
        timeOut: defaults.time,
        tapToDismiss: false,
        onclick: true,
        hideMethod: 'slideUp'
        // rtl: toastrRTL
    };

    // Toastr clicking action
    toastr.options.onclick = function () {
        if (defaults.url)
            window.open(defaults.url, '_self');
    }
    toastr[defaults.type](msg, title)

    playSound(defaults.type);
}

function playSound(type) {
    if (type === 'info') {
        let audio = new Audio('https://res.cloudinary.com/dxfq3iotg/video/upload/v1557233524/success.mp3');
        //audio.play();
    } else if (type === 'error') {
        let audio = new Audio('https://res.cloudinary.com/dxfq3iotg/video/upload/v1557233524/error.mp3');
       // audio.play();
    }
    return false;
}

/*POP UP BOX END*/

// Context Menu Build
function callActions(event, url, header, callBack, row, customUrl) {
    url = (customUrl) ? url : docurl + url;
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: row,
        success: function (res) {
            $(".tooltip").tooltip("hide");
            $("#context-menu").remove();
            let menu = $("<div id='context-menu' class='context-menu-list'></div>");
            let list = actions(res, header);
            menu.html(list);
            $('body').append(menu);
            //hide menu if already shown
            //get x and y values of the click event
            let cMenu = menu.find('#context-dropdown');
            let pageX = event.pageX;
            let pageY = event.pageY;
            //position menu div near mouse cliked area
            cMenu.css({top: pageY, left: pageX});
            setTimeout(function () {
                let mWidth = cMenu.width();
                let mheight = cMenu.height();

                let screenWidth = $(window).width();
                let screenHeight = $(window).height();
                //if window is scrolled
                let scrTop = $(window).scrollTop();
                //if the menu is close to right edge of the window
                if (pageX + mWidth > screenWidth) {
                    cMenu.css({left: pageX - mWidth});
                    cMenu.find("#context-sub-dropdown").removeClass('arrow-left').addClass('open-left arrow-right')
                }
                //if the menu is close to bottom edge of the window
                if (pageY + mheight > screenHeight + scrTop) {
                    cMenu.css({top: pageY - mheight});
                }
            }, 0);
            callBack(row);
        },
        error: function (err) {
            let message = (err.responseJSON) ? err.responseJSON.message : err.responseText;
            errorBox(message);
        }
    });
}

function actions(list, header, id) {
    let subMenu = false;
    if (list.length > 0) {
        let heading = (header) ? header : 'Actions';
        let div = document.createElement('div');
        div.setAttribute('class', 'dropdown-menu arrow-left show');
        div.setAttribute('id', 'context-dropdown');
        div.innerHTML = "<h4 class='dropdown-header'>" + heading + "</h4>";
        for (let k = 0; k < list.length; k++) {
            subMenu = false;
            let li = document.createElement('span');
            li.setAttribute('class', 'dropdown-item');
            for (dataAttr in list[k]) {
                if (Array.isArray(list[k][dataAttr])) {
                    subMenu = true;
                    if (dataAttr == 'Actions') {
                        let divider = document.createElement('div');
                        divider.setAttribute('class', 'dropdown-divider');
                        div.appendChild(divider);
                    }
                    let submenu = document.createElement('div');
                    submenu.setAttribute('class', 'dropdown-submenu');
                    submenu.innerHTML = "<button type='button' class='dropdown-item'>" + dataAttr + "</button>";
                    let subUl = document.createElement('div');
                    subUl.setAttribute('class', 'dropdown-menu arrow-left');
                    subUl.setAttribute('id', 'context-sub-dropdown');
                    subUl.setAttribute('role', 'menu');
                    for (s = 0; s < list[k][dataAttr].length; s++) {
                        let subLi = document.createElement('span');
                        subLi.setAttribute('class', 'dropdown-item');
                        for (subDataAttr in list[k][dataAttr][s]) {
                            if (subDataAttr === 'class')
                                list[k][dataAttr][s][subDataAttr] = list[k][dataAttr][s][subDataAttr] + ' dropdown-item';
                            subLi.setAttribute(subDataAttr, list[k][dataAttr][s][subDataAttr]);
                        }
                        subLi.innerHTML = list[k][dataAttr][s].name;
                        if (list[k][dataAttr][s].counts) {
                            let label = document.createElement('label');
                            label.setAttribute('class', 'badge badge-primary m-l-sm');
                            label.innerHTML = list[k][dataAttr][s].counts;
                            subLi.appendChild(label);
                        }
                        subUl.appendChild(subLi);
                    }
                    submenu.appendChild(subUl);
                    div.appendChild(submenu);
                } else {
                    if (dataAttr === 'class')
                        list[k][dataAttr] = list[k][dataAttr] + ' dropdown-item';
                    li.setAttribute(dataAttr, list[k][dataAttr]);
                }
            }
            if (!subMenu) {
                li.innerHTML = list[k].name;
                if (list[k].counts) {
                    let label = document.createElement('label');
                    label.setAttribute('class', 'badge badge-pill badge-primary ml-1');
                    label.innerHTML = list[k].counts;
                    li.appendChild(label);
                }
                div.appendChild(li);
            }

        }
        return div;
    }
    return false;
}

$(window).on('mousedown focus', function (e) {
    if (!$(e.target).parents("#context-menu").length > 0) {
        $("#context-menu").remove();
    }
});

$(document).on("click", '#context-menu span', function (event) {
    let button = $(this);
    button.closest('#context-menu').remove();
});
// Context Menu Build end

// Datatables Helpers
function lazySearch(iniTable, individual, tableId) {
    let api = iniTable.api();
    let searchWait = 0;
    let searchWaitInterval, oldSearchTerm = '';
    // Grab the datatables input box and alter how it is bound to events
    let t = $('.dataTables_filter input');
    if (individual) {
        if (tableId)
            t = $(tableId + ' thead input')
        else
            t = $('#dataTable thead input');
    }
    t.unbind() // Unbind previous default bindings
        .bind("input", function (e) { // Bind our desired behavior
            var item = $(this);
            searchWait = 0;
            if (!searchWaitInterval) searchWaitInterval = setInterval(function () {
                searchTerm = $(item).val().trim();
                if (oldSearchTerm != searchTerm) {
                    clearInterval(searchWaitInterval);
                    searchWaitInterval = '';
                    // Call the API search function
                    api.search(searchTerm).draw();
                    searchWait = 0;
                }
                oldSearchTerm = searchTerm;
                searchWait++;
            }, 1000);
            return;
        });
}

$.extend(true, $.fn.dataTable.defaults, {
    //dom: '<"top"B>BTfgtlipr',
    dom: '<"d-flex justify-content-between"Bf>rt<"bottom d-flex justify-content-between"ipl><"clear">',
    "bDestroy": true,
    serverSide: true,
    processing: true,
    ordering: true,
    fixedHeader: false,
    deferRender: true,
    initComplete: function () {
        lazySearch(this);
    },
    language: dTLanguage,
    "oLanguage": {
        "sProcessing": "<div class='btn btn-lg mb-0 ld-ext-top running'>Loading...<div class='ld ld-ring ld-spin-fast'></div></div>"
    },
    iDisplayLength: 25,
    aLengthMenu: [[25, 50, 100, -1], [25, 50, 100, 'All']],
});

function dTShadow(reinitialize) {
    let dTop = $('#dT-top'), ele = $("#dataTable");
    if (reinitialize || !dTop.length) {
        dTop.remove();
        let h = Math.floor(ele.find('thead').innerHeight());
        $('head').append('<style id="dT-top">.table.dataTable:not(.table-splitted):after{top:' + h + 'px}</style>');
    }
}

$("#dataTable").on("draw.dt", function () {
    dTShadow();
    let txt = '';
    $(this).find("tbody tr").find("td:not(.hide-tooltip,.row_no,.index)").off('mouseenter').on('mouseenter', function () {
        txt = $(this).text();
        if (txt !== '') {
            $(this).attr({
                'data-toggle': 'tooltip',
                'data-original-title': $(this).html(),
                'title': ''
            })
        }
    });
});

function dataTableExportButtons(title, options) {
    let button, buttonCommon, defaults = {
        columns: ":visible, .to-export",
        exportFormat: false,
        refreshCallBack: true,
        footerCallBack: false,
        showPrintBtn: true
    };
    jQuery.extend(defaults, options);
    buttonCommon = {
        title: title,
        footer: true,
        exportOptions: defaults.exportFormat || {
            columns: defaults.columns,
            stripHtml: true,
            rows: ':not(.hide)',
            format: {
                /* header : function (data, columnIndex, th) {
                     return data.replace(/(<([^>]+)>)/g, " ").trim();
                 },*/
                body: function (data, rowIndex, columnIndex, td) {
                    if (!$(td).parent('td').hasClass('hide'))
                        return $(td).contents().first().text().trim();
                }
            }
        }
    };
    button = [
        $.extend(true, {}, buttonCommon, {
            extend: 'copy',
            text: "<i class='fas fa-copy text-muted pr-2'></i> Copy",
            titleAttr: 'Copy',
            /*customize: function (a) {
                return a.replace(/(<([^>]+)>)/g, " ").trim();
            }*/
        }),
        $.extend(true, {}, buttonCommon, {
            extend: 'csv',
            text: "<i class='fas fa-file-csv text-muted pr-2'></i> CSV",
            titleAttr: 'CSV',
        }),
        $.extend(true, {}, buttonCommon, {
            extend: 'excel',
            rows: ':not(.hide)',
            text: "<i class='fas fa-file-excel text-muted pr-2'></i> Excel",
            titleAttr: 'Excel',
            autoFilter: true,
            customize: function (doc) {
                console.log(doc);
                let sheet = doc.xl.worksheets['sheet1.xml'];
                $('row:eq(1) c', sheet).attr('s', '42');
            }
        }),
    ];
    if (defaults.showPrintBtn)
        button.push(printButton());
    if (defaults.refreshCallBack)
        button.push(refreshButton());

    return [
        {
            extend: 'collection',
            text: 'Actions',
            className: 'btn-secondary',
            buttons: button
        }
    ];

    function refreshButton() {
        return {
            text: '<i class="fas fa-redo-alt text-muted pr-2"></i> Refresh',
            titleAttr: 'Refresh',
            action: function (e, dt) {
                dt.state.clear();
                if (defaults.refreshCallBack) {
                    if (typeof defaults.refreshCallBack === 'function')
                        defaults.refreshCallBack();
                    else if (typeof callBackDataTables === 'function')
                        callBackDataTables();
                    else $('#search').trigger('click');
                }
            }
        }
    }

    function printButton() {
        return {
            extend: 'print',
            text: "<i class='fas fa-print text-muted pr-2'></i> Print",
            titleAttr: 'Print',
            title: '',
            autoPrint: false,
            exportOptions: {
                columns: ":visible",
                rows: ':not(.hide)',
                format: {
                    body: function (data, rowIndex, columnIndex, td) {
                        return td.innerHTML;
                    }
                }
            },
            customize: function (win) {
                let doc = $(win.document), body = doc.find('body');

                doc.find('head').find('title').html(title + ' Print');

                body.css('font-size', '10pt')
                    .find('table')
                    .addClass('compact')
                    .removeClass('dataTable')
                    .css('font-size', 'inherit');

                setPrintHeaderFooter(body);
            }
        }
    }

    function setPrintHeaderFooter(element) {
        $.ajax({
            url: '/logo',
            type: 'GET',
            data: '',
            success: function (response) {
                element.prepend(response).find('#printTitle').html(title)
                    .end().find('#printSubTitle').html('Print');
                if (defaults.footerCallBack)
                    defaults.footerCallBack(element.find('table'));
            },
        });
    }
}

// Datatables Helpers End

// Bootup elements function
// Remove Validate Error
function removeValidateError(element) {
    $(element).closest('div.form-group').removeClass('error').addClass('validate');
    $(element).closest('div.form-group').find('label.error').remove();
}

// Bootup will call when page load statically & dynamically
function elasticRunner(element) {
    if (!element)
        element = $(".nav-tabs:last").find('a.nav-link.active');
    let elasticElement = $(element).closest("div.tabs-container").find("div.elastic");
    let activeWidth = element.parent('li').width();
    let itemPos = element.position();
    if (itemPos) {
        //itemPos.left = itemPos.left + ((element.innerWidth() - activeWidth) / 2);
        elasticElement.css({
            "bottom": itemPos.top + "px",
            "left": itemPos.left + "px",
            "width": activeWidth + "px"
        });
    }
}

function selectPicker(form, destroy) {
    let selectpicker = $(form).find("select.selectpicker"), g;
    if (destroy) {
        selectpicker.selectpicker('destroy');
    }
    if (selectpicker.length > 0) {
        selectpicker.not('[multiple],[required]').each(function () {
            if ($(this).find('option:first').text() !== 'Select') {
                $(this).prepend('<option value="">Select</option>');
            }
        });
        $.fn.selectpicker.Constructor.BootstrapVersion = '4';
        selectpicker.selectpicker({
            size: 5,
            container: 'body',
            liveSearch: true,
            showSubtext: true,
            style: 'btn-material',
            title: 'Select'
        });
        selectpicker.on('changed.bs.select', function () {
            if ($(this).val() !== '') {
                g = $(this).closest('.form-group');
                g.find('label.error').remove();
                g.removeClass('error').addClass('validate');
            }
        });

        $('.bootstrap-select').find('button').on('keydown', function (e) {
            if (e.which === 13) {
                $(this).click();
            }
        });
    }
}

// Initializing date picker
function datePicker(form) {
    let datePicker = form.find(".datepicker"),
        currentYear = (new Date()).getFullYear(),
        dP;
    if (datePicker.length > 0) {
        datePicker.attr({"placeholder": "dd-mm-yyyy", "autocomplete": "off"});
        let startDate, endDate, isDefault;
        <!-- Datepicker -->
        datePicker.each(function () {
            startDate = new Date(currentYear - 2, 0, 1);
            endDate = new Date(currentYear, 11, 31);
            if ($(this).attr('data-date-start-date')) {
                startDate = $(this).data('date-start-date');
            }
            if ($(this).attr('data-date-end-date')) {
                endDate = $(this).data('date-end-date');
            }
            if ($(this).attr('id') === 'from-date' || $(this).attr('id') === 'to-date') {
                startDate = false;
                endDate = false;
            }
            dP = $(this).datepicker({
                todayBtn: "linked",
                todayHighlight: true,
                keyboardNavigation: false,
                autoclose: true,
                calendarWeeks: false,
                format: "dd-mm-yyyy",
                placeholder: "dd-mm-yyyy",
                startDate: startDate,
                endDate: endDate
            }).on('changeDate', function () {
                removeValidateError($(this));
            });
            isDefault = $(this).data('default');
            if ($(this).val() === '' && (typeof isDefault === 'undefined' || isDefault)) {
                dP.datepicker('update', new Date());
            }
        });
    }
}

// Initializing currency with default value zero
function initCurrency(form) {
    let zeroVal = '0', isDefault;
    form.find("input.numeric,input.currency,input.decimal,input.integers,td.cell-amount").each(function () {
        isDefault = $(this).data('default');
        if ($(this).prop('tagName') === 'TD') {
            if ($(this).text() === "")
                $(this).text(zeroVal);
            $(this).number(true, fractionDigit);
        } else if ($(this).val() === '' && (typeof isDefault === 'undefined' || isDefault)) {
            $(this).val(zeroVal);
        }
    });
    form.find("input.numeric,input.currency,input.decimal,input.integers").on('click', function () {
        let value = $(this).val();
        let i = $(this).val().indexOf("-");
        $(this).selectRange(i + 1, (value.length) + 4); // For comma addition +4 added into length
    });

}

//Initialize maxLength
function initMaxLength(form) {
    form.find('input[maxlength],textarea[maxlength]').maxlength({
        threshold: 20,
        placement: 'top-right-inside',
        warningClass: "badge badge-pill badge-secondary",
        limitReachedClass: "badge badge-pill mb-1 bg-danger bg-lighten-3"
    });
}

function inputMask(form) {
    // Input Mask Plugin Initialize
    let amountEle = form.find("input.currency");
    amountEle.inputmask('currency',
        {
            'prefix': '',
            'digits': fractionDigit,
            'autoUnmask': true,
            'clearMaskOnLostFocus': true,
        }
    );
    let integerEle = form.find("input.integers");
    integerEle.inputmask('decimal',
        {
            'autoUnmask': true,
            'groupSeparator': '',
            'autoGroup': false,
            'digits': 0,
            'digitsOptional': false,
            'allowMinus': false,
            'placeholder': '0',
            'initialValue': 0
        }
    );
    let numbersEle = form.find('input.numeric');
    numbersEle.inputmask('currency',
        {
            'prefix': '',
            'digits': fractionDigit,
            'autoUnmask': true,
            'groupSeparator': '',
            'clearMaskOnLostFocus': true
        }
    );
    let decimalEle = form.find('input.decimal');
    decimalEle.inputmask('currency',
        {
            'prefix': '',
            'digits': 3,
            'autoUnmask': true,
            'allowMinus': false,
            'groupSeparator': '',
            'clearMaskOnLostFocus': true
        });
    let phoneEle = form.find('input.phone');
    phoneEle.inputmask('phone',
        {
            'alias': 'numeric',
        }
    );
}

function formValidation(form) {
    let d, ele;
    jQuery.validator.setDefaults({
        ignore: []
    });
    let validator = form.validate({
        invalidHandler: function () {
            let count = validator.numberOfInvalids();
            showToastr('Warning', validator.numberOfInvalids() + " field(s) are need to be filled", "error");
            if (count) {
                setTimeout(function () {
                    errorTabs(form);
                }, 500);
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').removeClass('validate').addClass('error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('error');
            $(element).tooltip('dispose');
        },
        errorPlacement: function (error, element) {
            ele = $(element);
            d = ele.closest('.form-group');
            if (d.prop('tagName') === 'DIV') {
                d.append(error)
            } else {
                ele.attr({
                    "data-toggle": "tooltip",
                    "data-trigger": "focus",
                    "title": error.text(),
                }).tooltip();
            }
        }, success: function (element) {
            $(element).closest('.form-group').addClass('validate');
            $(element).closest('.form-group').find('label.error').remove();
        }
    });
}

function fileInput(form) {
    let files = form.find("input[type=file]");
    if (files.length > 0) {
        form.find("input[type=file]").fileinput({
            showUpload: false,
            showPreview: false,
            showRemove: true,
            showCancel: false,
            focusCaptionOnBrowse: false,
            focusCaptionOnClear: false,
            browseLabel: '<i class="fa fa-folder-open"></i>',
            removeLabel: '<i class="fa fa-times"></i>',
            removeClass: 'btn btn-default',
            maxFileSize: 8024,
            allowedFileExtensions: ['jpg', 'jpeg', 'gif', 'png', 'svg', 'pdf', 'bmp', 'doc', 'docx', 'xls', 'xlsx']
        });
        $('.file-caption-main').each(function () {
            $(this).find('input').attr('tabindex', '-1');
        })
    }
}

function onRowBootup(row, destroy) {
    selectPicker(row, destroy);
    initCurrency(row);
    inputMask(row);
    initMaxLength(row);
    fileInput(row);
    inputCorrection(row);
}

function onBootup(form) {
    form = form ? form : $("#form:last");
    // Tab elastic design concept
    $(".nav-link").on('click', function (e) {
        $(this).closest('ul.nav-tabs').addClass('running');
        elasticRunner($(this));
    });
    setTimeout(function () {
        elasticRunner();
    }, 300);
    // Tab elastic concepts done

    // Elements Rendering Plugins

    // Tooltip
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        placement: 'auto',
        html: true,
        delay: 1000,
    });

    $('[data-toggle="popover"]').popover({
        placement: 'auto',
        html: true,
        trigger: 'hover',
    });

    // Trigger maxlength
    initMaxLength(form);

    <!-- Numeric Start -->
    initCurrency(form);

    // Input Mask Fn
    inputMask(form);

    $("#currency-rate").inputmask('decimal',
        {
            'alias': 'numeric',
            'groupSeparator': '',
            'autoGroup': false,
            'digits': 3,
            'radixPoint': ".",
            'digitsOptional': true,
            'allowMinus': false,
            'placeholder': '0',
            'initialValue': 0
        }
    );
    <!-- Input Mask End -->

    // Selectpicker
    selectPicker(form);

    // Datepicker
    datePicker(form);

    // File Input
    fileInput(form);

    // Form validating fn
    formValidation(form);

    //Reset Form
    $("#clear").off('click').on('click', function () {
        resetForm(form);
    });

    //Set zero amount
    inputCorrection(form);
}

$.fn.getCursorPosition = function () {
    var input = this.get(0);
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
    } else if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
    }
};

// Selection Range
$.fn.selectRange = function (start, end) {
    return this.each(function () {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            let range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};


/*FORM RESET*/
function resetForm(form) {
    form[0].reset();
    datePicker(form);
    form.find('tr.dynamic-row').remove();
    form.find('select.selectpicker').selectpicker('refresh');
    form.find("label.error").remove();
    form.find('.nav-link.text-danger').removeClass('text-danger');
    form.find(".error").removeClass('error');
}

/*FORM RESET END*/

/** Match Height for Cards **/
// Match the height of each card in a row
function matchHeight() {
    $('.row.match-height').each(function () {
        $(this).find('.bordered-card').matchHeight(); // Not .card .card prevents collapsible cards from taking height
        $(this).find('.card').not('.card .card').matchHeight(); // Not .card .card prevents collapsible cards from taking height
    });
}

/** End **/

/** MODAL BOX **/
function showModalBox(header, msg, name, size) {
    name = name.replace(/ +/g, "").toLowerCase();
    size = size ? size : 'large';
    $('body').append('<div class="modal fade" id="modal-' + name + '"  role="dialog" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered shadow-sm" role="document"><div class="modal-content"><div class="modal-header"> ' +
        '<h4 class="modal-title"></h4><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span>' +
        '</button></div><div class="modal-body"></div>' +
        '<div class="modal-footer" id="modal-buttons"><button type="button" class="btn btn-default btn-flat" id="clear">' + __('Clear') + '</button> ' +
        '<button type="button" class="btn btn-primary" id="submit">' + __("Save") + '</button>' +
        ' </div></div></div></div>');
    let newModal = $("#modal-" + name);
    newModal.find(".modal-title").html(header);
    if (msg !== '') {
        newModal.find(".modal-body").html(msg);
    }
    let modalDialog = newModal.find(".modal-dialog");
    modalDialog.removeClass('modal-lg');
    let modalSize = {
        large: "modal-xl", medium: "modal-lg", small: "modal-sm", full: "modal-full"
    };
    modalDialog.addClass(modalSize[size]);
    newModal.modal({
        backdrop: 'static',
        keyboard: true
    });
    newModal.on('hide.bs.modal', function (e) {
        let url = $(this).find('#data-url').val();
        if (typeof url !== 'undefined' && url !== '') {
            let action = url.substring(url.lastIndexOf('/') + 1);
            if (e.namespace === 'bs.modal' && action !== 'view') {
                let changedForm = $(this).find('form').serialize();
                if (changedForm !== initialForm) {
                    e.preventDefault();
                    e.stopPropagation();
                    confirmBox({
                        title: 'Changes Deducted',
                        text: 'Are you sure to close?',
                        type: 'red',
                        confirmButtonText: 'Discard',
                        confirmClass: 'btn-danger',
                        cancelButtonText: 'Continue editing',
                        cancelCallBack: false,
                        confirmCallBack: function () {
                            initialForm = changedForm;
                            destroyModal(newModal);
                        },
                    })
                }
            }
        }
    })
    newModal.on('hidden.bs.modal', function () {
        destroyModal(newModal);
    })
}

function destroyModal(m) {
    let modal = $(m);
    modal.removeData('bs.modal');
    modal.addClass('fadOutRight');
    modal.next('.modal-backdrop').remove();
    modal.remove();
    let modals = $('.modal');
    if (modals.length > 0) {
        modals.last().removeClass('shrink-modal').css('margin-top', '');
        shrinkModalClose();
    }
}

// Destroy last modal
function destroyModalBox() {
    // This is need to be first before fetching modals
    let summernote = $('.summernote');
    if (summernote.length) {
        summernote.each(function () {
            $(this).summernote('destroy');
        })
    }
    let modals = $(document.getElementsByClassName('modal'));
    let lastModal = modals.last();
    destroyModal(lastModal);
    $(".bootstrap-select.open").remove();
    form = $("#form");
}

function getDataInModal(url, name, callBack, options) {
    let defaults = {
        size: 'large',
        data: '',
        buttons: !0,
        customButtons: false,
        customUrl: false,
        method: 'GET',
    };
    jQuery.extend(defaults, options);
    url = (defaults.customUrl) ? url : getUrl() + url;
    if (defaults.shrinkModal) {
        let sw = $('.shrink-modal').length + 1;
        let lm = $('.modal:last');
        lm.addClass('shrink-modal').css('margin-top', (sw * 100) + 'px');
        lm.find('.modal-content').append('<span class="sm-count">' + sw + '</span>');
    }
    name = name.replace('/', '-'); // For branch code
    let modalName = name + '-' + random(); // adding random number multiple modals
    showModalBox(name, '', modalName, defaults.size);
    processModalBody(url, modalName, callBack, defaults);
    let modals = $(".modal");
    let lastModal = modals.last();
    if (modals.length > 1) {
        $(".modal-backdrop:last").css('z-index', '1060');
        lastModal.css('z-index', '1070');
    }
    lastModal.focus();
}

function processModalBody(url, name, callBack, options) {
    options = (options) ? options : {size: 'large', data: '', buttons: !0};
    name = (name) ? name.replace(/ +/g, "").toLowerCase() : false;
    let modal = (name) ? $("#modal-" + name) : $(".modal[role=dialog]:last");
    let modalBody = modal.find(".modal-body");
    modalBody.html(progressLoader());

    /*modalBody.slimScroll({
        height: '75vh',
        railOpacity: 0.9
    });*/
    if (options.customButtons) {
        $("#submit").before(options.customButtons)
    }
    if (!options.buttons) {
        modal.find("#modal-buttons").html('');
    }
    $.ajax({
        url: url,
        type: options.method,
        data: options.data,
        success: function (response) {
            modalBody.html(response);
            let firstInput = modalBody.find(':input.form-control').first();
            setTimeout(function () {
                if (firstInput.hasClass('selectpicker') && firstInput.val() === '') {
                    $(firstInput).data('selectpicker').$button.focus();
                } else {
                    $(firstInput).not('.datepicker').focus();
                }
            }, 500);
            if (callBack) {
                if (typeof callBack === "string") {
                    window[callBack](options.data);
                } else
                    callBack(options.data);
                modelCallBackFn(modalBody, options);
            }
        },
        error: function (res) {
            let message = '';
            if (typeof res === 'string') {
                message = res;
            } else {
                let error = res.responseJSON;
                message = error.message + ' ' + error.exception;
            }
            modalBody.html('<div class="text-center d-flex flex-wrap align-content-center height-80-per"><div class="text-danger flex-fill"> <i class="fas fa-4x fa-bug"></i><h5 class="mt-2">Error !, While loading data</h5></div><div class="alert alert-secondary">' + message + '</div>');
        }
    })
}

function shrinkModalClose() {
    $('.sm-close').remove();
    let sm = $('.shrink-modal'), sw = sm.length + 1;
    sm.after('<button class="sm-close" style="top:' + ((sw * 100)) + 'px">Close All</button>');
}

function modelCallBackFn(modalBody, options) {
    let type = $("#type");

    if (options.shrinkModal) {
        shrinkModalClose();
    }

    $('.sm-close').on('click', function () {
        let t = 300, $m = $('.modal'), $mb = $('.modal-backdrop');
        $m.each(function (i, el) {
            setTimeout(function () {
                let modal = $(el);
                modal.addClass('animated fadeOutLeft');
                modal.removeData('bs.modal');
                modal.next('.modal-backdrop').remove();
                modal.remove();
                $mb.eq(i).remove();
            }, t);
            t += 100;
        })
        $('.sm-close').remove();
    })

    initialForm = modalBody.find('form').serialize();
    modalBody.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        let href = e.target.attributes.href.value;
        if (href) {
            let target = href.value;
            let firstInput = $(target).find(':input.form-control').first();
            setTimeout(function () {
                if (firstInput.hasClass('selectpicker') && firstInput.val() === '') {
                    $(firstInput).data('selectpicker').$button.focus()
                } else {
                    $(firstInput).not('.datepicker').focus();
                }
            }, 500);
        }
    });

    $("#salesman-id").on('change', function () {
        let val = $(this).val();
        if (val === "NsalesmanN") {
            $(this).val('');
            getDataInModal("quick_salesman", "Quick Salesman", quickSalesman, {size: 'medium', buttons: false});
        }
    });

    $("#customer-id,#supplier-id").on('change', function () {
        let val = $(this).val();
        if (val === "NcustomerN") {
            $(this).val('');
            getDataInModal("quick_customer", "Quick Customer", quickCustomer, {size: 'medium', buttons: false});
        } else if (val === "NsupplierN") {
            $(this).val('');
            getDataInModal("quick_supplier", "Quick Supplier", quickSupplier, {size: 'medium', buttons: false});
        }
    });

    $("#prospect").on('change', function () {
        let val = $(this).val();
        if (val === "NprospectN") {
            $(this).val('');
            getDataInModal("quick_prospect", "Quick Prospect", quickProspect, {size: 'medium', buttons: false});
        }
    });

    type.on('change', function () {
        typeChange();
    });

    function typeChange() {
        let val = type.val(),
            employeeId = $("#employee_id"),
            vendorName = $("#vendor_name");
        employeeId.add(vendorName).attr('disabled', 'disabled').parent('td').removeClass('has-error');
        if (val == 'Employee') {
            employeeId.removeAttr('disabled');
            vendorName.val('');
        } else if (val == 'Vendor') {
            vendorName.removeAttr('disabled');
            employeeId.val('');
        }
        employeeId.selectpicker('refresh');
    }
}

/*MODAL END*/

/* RIGHT FLOAT BAR */
$('.floatbar-toggle').on('click', function () {
    floatBarToggle();
});

$("#rb-alert").on('click', function () {
    getDataInFloatBar('alerts', 'Alerts', alertCall, {data: {'type': 0}});
});

$("#rb-reminder").on('click', function () {
    setTimeout(function () {
        dayCalendar();
    }, 200);
});

$('#rb-learning').on('click', function () {
    firstSegment = (firstSegment !== '') ? firstSegment : 'dashboard';
    let linkUrl = getUrl() + 'tutorial/' + firstSegment;
    let btns = '<a href="' + linkUrl + '" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm"><i class="ft-external-link"></i> New Tab </button></a>';
    getDataInFloatBar('tutorial/' + firstSegment + '/async', 'DOCUMENTATION', false, {linkButtons: btns});
});

$('#rb-tasks').on('click', function () {
    taskCards();
});

$('#rb-feedback').on('click', function () {
    feedBack();
});

$('#rb-docs').on('click', function () {
    documents();
});

$('#customizer-toggle-icon').on('click', function () {
    getDataInFloatBar('theme/customizer', 'THEME CUSTOMIZER', themeCustomizer, {linkButtons: 'Customize & Preview in Real Time'});
});

function floatBarToggle() {
    let notificationBar = $('#notification-sidebar');
    let floatBody = $('#floatbar-body');
    if (notificationBar.hasClass('open')) {
        floatBody.html('');
        notificationBar.removeClass('open');
    } else {
        notificationBar.addClass('open');
    }
    randomLoader(floatBody);
}

function floatBarButtons(customButtons) {
    return '<div class="row">\n' +
        '    <div class="col-12 text-right">\n' +
        '        <button type="button" class="btn btn-default btn-flat mb-0" id="clear">' + __("Clear") + '</button>\n' + customButtons +
        '        <button type="button" class="btn bg-primary-v1" id="submit">' + __("Save") + '</button>\n' +
        '    </div>\n' +
        '</div>';

}

function getDataInFloatBar(url, name, callBack, options) {
    let defaults = {
        data: '',
        customUrl: false,
        type: 'GET',
        buttons: false,
        customButtons: '',
        linkButtons: ''
    };
    jQuery.extend(defaults, options);
    url = (defaults.customUrl) ? url : getUrl() + url;
    $("#floatbar-title").html(name);
    let floatBarContent = $("#floatbar-body");
    $.ajax({
        url: url,
        type: defaults.type,
        data: defaults.data,
        success: function (response) {
            floatBarContent.html(response);
            if (defaults.buttons)
                floatBarContent.append(floatBarButtons(defaults.customButtons));
            if (defaults.linkButtons)
                $('#floatbar-link-buttons').html(defaults.linkButtons);
            if (callBack) {
                if (typeof callBack === "string") {
                    window[callBack](defaults.data);
                } else
                    callBack(defaults.data);
            }
        },
        error: function (res) {
            let message = '';
            if (typeof res === 'string') {
                message = res;
            } else {
                let error = res.responseJSON;
                message = error.message + ' ' + error.exception;
            }
            floatBarContent.html('<div class="text-center d-flex flex-wrap align-content-center height-80-per"><div class="text-danger flex-fill"> <i class="fas fa-4x fa-bug"></i><h5 class="mt-2">Error !, While loading data</h5></div><div class="alert alert-secondary">' + message + '</div>');
        }
    })
}

/* RIGHT FLOAT BAR END */

/* AJAX PROCESSING START*/

// Sending data to server while submit
function sendData(url, callBack, options) {
    let defaults = {
        form: "form",
        method: "POST",
        data: 0,
        alert: 0,
        closeModal: 1,
        reload: 0,
        extras: 0,
        dataTable: true,
        reset: false,
        submitBtnId: 'submit'
    };

    jQuery.extend(defaults, options);

    let form = $('#' + defaults.form);
    let checkId = form.find("#data-id").val();
    // if ((checkId) && checkId !== '') {
    //     defaults.reset = false;
    // }
    if (form.find('input[name=_method]').length > 0) {
        defaults.method = form.find('input[name=_method]').val();
    }
    let disabledFields = form.find('select:disabled,input:disabled');
    disabledFields.prop('disabled', false);
    form.find('select.selectpicker').selectpicker('refresh');

    form.ajaxSubmit({
        type: "POST",
        url: url,
        method: defaults.method,
        dataType: "json",
        data: defaults.data,
        beforeSend: function () {
            btnLoader(defaults.submitBtnId);
        },
        success: function (res) {
            disabledFields.prop('disabled', true);
            destroyLoaders();
            let title = 'Success';
            if (defaults.alert === 'toastr') {
                if (res.title)
                    title = res.title;
                showToastr(title, res.message, 'success');
            } else {
                alertBox(title, {text: res.message, timer: 3000});
                if (!defaults.closeModal) {
                    let actionUrl = url.substring(url.lastIndexOf('/') + 1);
                    if (actionUrl === 'edit' && callBack && callBack !== 'callBackDataTables') {
                        processModalBody(url, false, callBack);
                    }
                }
            }
            if (typeof callBackDataTables == 'function' && defaults.dataTable)
                callBackDataTables(defaults.extras);
            if (defaults.reload)
                location.reload();
            if (defaults.reset)
                resetForm(form);
            if (defaults.closeModal)
                destroyModalBox();
            if (callBack) {
                (typeof callBack == "string") ? window[callBack](res, defaults.extras) : callBack(res, defaults.extras);
            }
            disabledFields.selectpicker('refresh');
        },
        error: function (err) {
            disabledFields.prop('disabled', true);
            disabledFields.selectpicker('refresh');
            destroyLoaders();
            let message = (err.responseJSON) ? err.responseJSON.message : err.responseText;
            errorBox(message);
        }
    });
}

function loadSection(options) {
    let defaults = {
        loader: true,
        loop: 5,
        url: getFullUrl(),
        form: "form-filter",
        method: "POST",
        target: 'load-section',
        data: 0,
        callBack:false,
    };
    jQuery.extend(defaults, options);

    // Table loader start
    if (defaults.loader) {
        tableLoader(defaults.target, defaults.loop);
    }

    let form = $('#' + defaults.form);

    form.ajaxSubmit({
        type: defaults.method,
        url: defaults.url,
        data: defaults.data,
        success: function (res) {
            destroyLoaders();
            $('#' + defaults.target).html(res);
            if (defaults.callBack) {
                defaults.callBack(defaults.extras);
            }
        },
        error: function (err) {
            destroyLoaders();
            destroyTableLoader(defaults.target);
            let message = (err.responseJSON) ? err.responseJSON.message : err.responseText;
            errorBox(message);
        }
    });
}

/*call confirm box and delete data*/
function deleteData(url, title, callback, options) {
    let defaults = {
        data: 0,
        extras: 0,
        callDt: true,
        needOptions: false,
    };
    if (options && options.callDt === false) {
        defaults.needOptions = true;
    }
    title = (title) ? title : 'Are you sure to want to delete?';
    jQuery.extend(defaults, options);
    $.confirm({
        title: 'Attention',
        content: title,
        type: 'yellow',
        buttons: {
            cancel: {
                text: 'Cancel',
                btnClass: 'btn-default btn-flat',
                action: function () {
                    if (defaults.cancelCallBack) {
                        defaults.cancelCallBack();
                    }
                },
            },
            confirm: {
                text: 'Delete',
                btnClass: 'btn-danger',
                action: function () {
                    stickLoader('Delete', 'Deleting Data', true);
                    $.ajax({
                        type: 'DELETE',
                        url: getUrl() + url,
                        data: defaults.data,
                        dataType: 'json',
                        success: function (res) {
                            destroyLoaders();
                            if (typeof callBackDataTables === "function" && defaults.callDt) {
                                callBackDataTables();
                            }
                            let message = (res.message) ? res.message : 'Successfully Deleted';
                            showToastr('Deleted', message, 'success');
                            if (callback && !defaults.callDt && !defaults.needOptions)
                                callback(res);
                            else if (callback) {
                                callback(options);
                            }
                        },
                        error: function (err) {
                            errorMessage(err);
                        }
                    });
                },
            },
        },
    });
}

// Downloading file fn
function downloadDocument(url, name, options) {
    let date = new Date();
    name = name + "-" + date.getDate() + date.getMonth() + date.getYear() + date.getSeconds();
    stickLoader(name, 'Downloading File', true);
    let defaults = {
        type: 'GET',
        data: false,
        extension: 'pdf'
    };
    jQuery.extend(defaults, options);
    $.ajax({
        type: defaults.type,
        url: getUrl() + url,
        xhr: function () {
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            return xhr;
        },
        data: defaults.data,
        success: function (res) {
            destroyStickLoader();
            let blob = new Blob([res], {type: 'application/' + defaults.extension});
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = name + "." + defaults.extension;
            document.body.appendChild(link);
            link.click();
            showToastr('Success', name + ' File downloaded', 'success')
        },
        error: function (err) {
            errorMessage(err);
        }
    })
}

function exportExcel(url, options) {
    let defaults = {
        form: "form",
        method: "POST",
        data: 0,
        reload: 0,
        submitBtnId: 'export'
    };
    let date = new Date();
    name = name + "-" + date.getDate() + date.getMonth() + date.getYear() + date.getSeconds();
    jQuery.extend(defaults, options);
    let form = $('#' + defaults.form);
    form.ajaxSubmit({
        type: "POST",
        url: url,
        method: defaults.method,
        dataType: "json",
        data: defaults.data,
        success: function (res) {
            destroyLoaders();
            let data = window.btoa(JSON.stringify(res));
            downloadDocument(url + '/excel', 'Opening Balance', {
                type: 'POST',
                data: {data: data},
                extension: 'xlsx'
            });
        },
        error: function (err) {
            errorMessage(err);
        }
    })
}

function backgroundPostData(url, data, callBack, options) {
    let defaults = {
        type: 'POST',
        alert: false
    };
    jQuery.extend(defaults, options);
    $.ajax({
        type: defaults.type,
        url: getUrl() + url,
        dataType: 'json',
        data: data,
        success: function (res) {
            destroyLoaders();
            if (defaults.alert) {
                let title = (res.title) ? res.title : 'Success';
                if (defaults.alert === 'alert')
                    alertBox(title, res.message);
                else {
                    showToastr(res.title, res.message, 'success');
                }
            }

            if (typeof callBack === 'function') {
                if (callBack.name === 'callBackDataTables')
                    callBackDataTables();
                else
                    callBack(res, options);
            }
        },
        error: function (err) {
            errorMessage(err, defaults.alert);
        }
    });
}

function getMailBox(url, data) {
    data = (data) ? data : false;
    getDataInModal(url, 'Compose Mail', mailCallback, {size: 'medium', data: data})
}

/** SET COMPANY ID SESSION **/
$('.switch-company').off('click').on('click', function () {
    setCompany($(this).data('id'));
});

$('.locale').on('change', function () {
    setLocale($(this).val());
});

$(function () {
    $(window).on('focus', isCompanyChanged);
});

function setCompany(id) {
    backgroundPostData('company/switch', {id: id}, changeCompany);
}

function setLocale(locale) {
    backgroundPostData('locale/' + locale, false, pageReload);
}

function changeCompany(res) {
    localStorage.setItem('company-id', res.data.id);
    localStorage.setItem('csrf', CSRF);
    pageReload();
}

function isCompanyChanged() {
    let c = parseInt(localStorage.getItem('company-id'));
    let s_csrf = localStorage.getItem('csrf');
    let local = parseInt($('.switch-company.active').data('local'));
    let flag = false;
    if ((s_csrf === CSRF) && !isNaN(c) && !isNaN(local)) {
        flag = (local !== c);
        if (flag && companyFlag) {
            $.alert({
                title: 'Company Alert',
                content: 'You have changed company in other tabs',
                type: 'red',
                closeIcon: false,
                bgOpacity: 0.5,
                autoClose: 0,
                animateFromElement: false,
                typeAnimated: true,
                buttons: {
                    confirm: {
                        text: 'Reload',
                        btnClass: 'btn-primary',
                        action: function () {
                            window.location.reload();
                        }
                    },
                },
            });
            companyFlag = false;
        }
    }
    return flag;
}

/** Company Session End **/

// CLosing Fn of Version Modal Don't Remove
$("#version-checkout").on('click', function () {
    $("#exampleModalCentered").modal('hide');
    backgroundPostData('version/seen', '', function () {
        window.location.href = '/versions';
    },);
});


//Notification
let singleNotifyCall = 1, notificationMenu = $("#notification-menu"), notifyLength = 0, loadedNotifications = 0;
$("#notification").on("click", function () {
    $(this).parent().toggleClass('open');
    $('#notification_count').html(0);
    backgroundPostData('notification/makeZero');
    let img = getUrl() + 'img/loader.gif';
    notificationMenu.html('<div id="notification-loader" class="text-center"><img src="' + img + '" width="100%" height="auto" alt="Loader"></div>');
    backgroundPostData('getNotifications/0', '', notificationConstructor);
});

function notificationConstructor(data) {
    $("#notification-loader").remove();
    let divider = document.createElement('div');
    divider.setAttribute('class', 'dropdown-divider');
    for (let k = 0; k < data.length; k++) {
        let a = document.createElement('div');
        a.setAttribute('data-href', data[k].url);
        a.setAttribute('class', 'notification-item dropdown-item px-1 py-0');
        let media = document.createElement('div');
        media.setAttribute('class', 'media');
        let img = document.createElement('img');
        img.setAttribute('src', data[k].image);
        img.setAttribute('class', 'rounded-circle float-left img-lg d-flex align-self-center ml-2');
        media.appendChild(img);
        let span1 = document.createElement('div');
        span1.setAttribute('class', 'media-body');
        span1.innerHTML = '<div><b class="notification-title"> ' + data[k].title + ' </b><span class="float-right font-small-2 text-muted pr-3">'+data[k].full_ago+'</span></div>';
        let span2 = document.createElement('span');
        span2.setAttribute('class', 'line-height-1 d-block font-small-3 message');
        span2.innerHTML = data[k].message;
        span1.appendChild(span2);
        let span3 = document.createElement('small');
        span3.setAttribute('class', 'text-muted font-small-2');
        span3.innerHTML = data[k].notification_date + ' - ' + data[k].notification_time;
        span1.appendChild(span3);
        media.appendChild(span1);
        a.appendChild(media);
        notificationMenu.append(a);
        notificationMenu.append('<div class="dropdown-divider"></div>');
    }
    singleNotifyCall = 1;
    notifyLength = $("#notification-menu div.dropdown-item").length;

    $(".notification-item").off('click').on('click', function () {
        let url = $(this).data('href'),
            name = $(this).find('b.notification-title').text(),
            rowNo = $(this).find('span.message').find('b small').text();
        if (url) {
            if (!url.includes('delete')) {
                if (url.includes('status') || url.includes('tax')) {
                    window.open(getUrl() + url, '_blank');
                } else {
                    getDataInModal(url, name + ' - ' + rowNo, up, {buttons: false});
                }
            }
        }
    });
}

let notifyBottom = 0, scrollDown = 0;
notificationMenu.scroll(function (e) {
    notifyBottom = replaceAll('px', '', notificationMenu.next('.slimScrollBar').css('bottom'));
    let st = $(this).scrollTop();
    if (notifyBottom < 30 && singleNotifyCall == 1 && st > scrollDown) {
        backgroundPostData('getNotifications/' + notifyLength, '', notificationConstructor);
        singleNotifyCall++;
    }
    scrollDown = st;
});

notificationMenu.slimScroll({
    height: '350px',
    railOpacity: 0.3,
    railVisible: true
});

//memo
function memoCall(response) {

    let form = $("#form");
    datePicker(form);
    initMaxLength(form);
    formValidation(form);

    $("#time").timeDropper({
        borderColor: '#1ab394',
        format: 'hh:mm a',
        meridians: 1,
        autoswitch: 1,
        setCurrentTime: false,
    });

    $("#addAsReminder").on('click', function () {
        let common = $('.common');
        if ($(this).is(":checked")) {
            common.removeClass('d-none');
            common.find('input').prop("required", true);
        } else {
            common.find('input').prop("required", false);
            common.addClass('d-none');
        }
    });

    $('.delete').off('click').on('click', function () {
        let element = $(this);
        deleteData('memo/' + element.data('id') + '/delete', '', function () {
            element.closest('tr').remove();
            rowSno('#memo-list');
        }, {alert: true, callDt: true});
    });

    $("#submit").on('click', function () {
        let url = $("#data-url").val();
        if (form.valid())
            sendData(url + '/save', false, {alert: 'toastr', closeModal: true, dataTable: false});
    });
}

/* Badge Constructor */
function badgeExecute(element, url) {
    let setTimeoutConst;
    $(element).off('mouseenter').on("mouseenter", function (e) {
        let id = $(this).closest('tr').attr('data-id');
        setTimeoutConst = setTimeout(function () {
            let header = $(this).find('td.row_no').html();
            let row = $(this);
            let badgeUrl = (url) ? url : '/';
            let customUrlStatus = !!url;
            badgeBox(e, badgeUrl + id + '/badge', header, false, row, customUrlStatus);
        }, 1000);
    }).on("mouseleave", function (e) {
        clearTimeout(setTimeoutConst);
    });
}

/* Badge Box */
function badgeBox(event, url, header, callBack, row, customUrl) {
    url = (customUrl) ? url : docurl + url;
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: row,
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (res) {
            $(".tooltip").tooltip("hide");
            $("#context-menu").remove();
            let menu = $("<div id='context-menu' class='context-menu-list badge-box-list'></div>");
            let list = badge(res);
            menu.html(list);
            $('body').append(menu);
            //hide menu if already shown
            //get x and y values of the click event
            let pageX = event.pageX;
            let pageY = event.pageY;
            //position menu div near mouse cliked area
            menu.css({top: pageY, left: pageX, 'position': 'absolute'});
            let mwidth = menu.width();
            let mheight = menu.height();
            let screenWidth = $(window).width();
            let screenHeight = $(window).height();
            //if window is scrolled
            let scrTop = $(window).scrollTop();
            //if the menu is close to right edge of the window
            if (pageX + mwidth > screenWidth) {
                menu.css({left: pageX - mwidth});
            }
            //if the menu is close to bottom edge of the window
            if (pageY + mheight > screenHeight + scrTop) {
                menu.css({top: pageY - mheight});
            }
            //finally show the menu
            menu.show();

            $('#badge-close').on('click', function () {
                $('.badge-box-list').remove();
            });

            if (callBack)
                callBack(row);
        },
        error: function (err) {
            let message = (err.responseJSON) ? err.responseJSON.message : err.responseText;
            alertBox('Error', message, 'error');
        }
    });
}

/* Badge Constructor */
function badge(data) {
    let badge = $(document.createElement('div'));
    badge.attr('class', 'show badge-box shadow');
    badge.append('<span class="float-right font-medium-5 pr-2 pt-1 pointer" id="badge-close">&times;</span>');

    let header = $(document.createElement('div'));
    header.attr('class', 'badge-header');
    header.html('<div class="badge-hint">' + data['hint'] + '</div>');
    let title = $(document.createElement('div'));
    title.attr('class', 'badge-title');
    title.append('<h3>' + data['title']['name'] + '</h3>');
    for (k = 0; k < data['title']['description'].length; k++) {
        title.append('<p>' + data['title']['description'][k] + '</p>');
    }
    header.append(title);
    badge.append(header);

    let description = $(document.createElement('div'));
    description.attr('class', 'badge-description');
    for (k = 0; k < data['description'].length; k++) {
        description.append('<p>' + data['description'][k] + '</p>');
    }
    badge.append(description);

    let footer = $(document.createElement('div'));
    footer.attr('class', 'badge-footer');
    footer.append('<span class="badge-hint-1">' + data['footer']['hint-1'] + '</span>');

    let hint2 = $(document.createElement('span'));
    hint2.attr('class', 'badge-hint-2');
    for (j = 0; j < data['footer']['hint-2'].length; j++) {
        hint2.append(data['footer']['hint-2'][j]);
    }
    footer.append(hint2);
    badge.append(footer);
    return badge;
}

$('#customers-job').on('change', function () {
    let values = $(this).val();
    if (values.length) {
        backgroundPostData('customer/job/list', {values: values}, setJobListOptions);
        stickLoader('Loading Jobs', 'Loading Selected Customer Jobs', true);
    } else
        $('#jobs').html('').selectpicker('refresh');
});

//Loading Job for Selected Customers
function setJobListOptions(res) {
    //@v4
    let jobData = res.data,
        length = res.data.length,
        jobs = $("#jobs");

    jobs.html('');
    if (length > 0) {
        if (jobs.attr('isMultiple') === 'false') {
            let opt = document.createElement('option');
            opt.setAttribute('value', '');
            opt.setAttribute('disabled', 'true');
            opt.setAttribute('selected', 'true');
            opt.setAttribute('data-subtext', '');
            opt.innerHTML = 'select';
            jobs.append(opt);
        }
        let jobVal = (jobs.data('rowno') === true) ? 'row_no' : 'id';
        for (let k = 0; k < length; k++) {
            let opt = document.createElement('option');
            opt.setAttribute('value', jobData[k][jobVal]);
            opt.setAttribute('data-subtext', jobData[k]['customer']['name']);
            opt.setAttribute('data-customerID', jobData[k]['customer']['id']);
            opt.innerHTML = jobData[k]['row_no'];
            jobs.append(opt);
        }
    }
    jobs.selectpicker('refresh');
}

function filterRedirect(url, options) {
    let customers = $('#customers-job'),
        fromDate = $('#from-date'),
        toDate = $('#to-date');

    let filters = {
        from: (fromDate.length) ? fromDate.val() : '',
        to: (toDate.length) ? toDate.val() : '',
        customers: (customers.length) ? customers.val() : []
    };
    jQuery.extend(filters, options);
    let filterData = JSON.stringify(filters),
        cryptData = window.btoa(filterData);
    window.open('/' + url + '?q=' + cryptData);
}


//service icons
function serviceList(services) {
    services = JSON.parse(services.replace(/&quot;/g, '"'));
    let element = '', id = '', description = '', s,
        sIcons = {
            "1": "fas fa-user-clock",
            "2": "fas fa-ship",
            "3": "fas fa-box-open",
            "4": "fas fa-truck",
            "5": "fas fa-tools",
            "6": "fas fa-warehouse",
            "7": "fas fa-people-carry",
        };
    for (s = 0; s < services.length; s++) {
        element += '<small class="badge badge-pill bg-lighten-v3 mr-1">';
        id = services[s];
        description = serviceDescriptions(services[s]);
        element += '<i data-toggle="tooltip" title="' + description + '" class="' + sIcons[id] + '"></i>';
        element += '</small>';
    }
    return element;
}

function serviceDescriptions(key) {
    let services = [
        'Customs Clearance',
        'Freight Forwarding', 'Packing & Relocation',
        'Trading',
        'Transportation',
        'Value Added Services',
        'Warehousing',
        ''
    ];
    return services[key];
}


/* Decimal Point */
function getFractionDigit() {
    /*fractionDigit = localStorage.getItem('decimalPoint');
    if (!fractionDigit)
        backgroundPostData('settings/amount/fraction', false, setFractionDigit);*/
    fractionDigit = 2;
}

function setFractionDigit(res) {
    let dePoint = (res) ? parseInt(res) : 2;
    localStorage.setItem('decimalPoint', dePoint);
    fractionDigit = dePoint;
}

/*For geting taxes from tax table with group relation*/
function getTaxes()
{
    backgroundPostData('taxes','',setTaxes);
}

function setTaxes(res) {
    TAXES = res;
}
/** Mail Compose Js **/
function mailCallback() {
    let typeaheadJson;
    $.ajax({
        url: '/mail/typeahead',
        type: 'POST',
        success: function (response) {
            typeaheadJson = response;
        }
    });

    $("#file").fileinput({
        showUpload: false,
        showPreview: false,
        showRemove: true,
        browseLabel: '<i class="fa fa-folder-open"></i>',
        removeLabel: '<i class="fa fa-times"></i>',
        removeClass: 'btn btn-default',
        maxFileSize: 8024,
        allowedFileExtensions: ['jpg', 'jpeg', 'gif', 'png', 'svg', 'pdf', 'bmp', 'doc', 'docx', 'xls', 'xlsx']
    });

    $("#summernote").summernote({
        placeholder: "Content here...",
        height: 250,
        toolbar: [["style", ["bold", "italic", "underline", "clear"]], ["fontsize", ["fontsize"]], ["color", ["color"]], ["para", ["ul", "ol", "paragraph"]], ["height", ["height"]]]
    }), $.fn.multiple_emails = function (t) {
        let n = $.extend({}, {checkDupEmail: !0, theme: "Bootstrap", position: "top"}, t), c = "";
        return n.theme.toLowerCase() == "Bootstrap".toLowerCase() && (c = '<a href="#" class="multiple_emails-close" title="Remove"><i class="fas fa-times-circle"></i></a>'), this.each(function () {
            let s = $(this), a = $('<ul class="multiple_emails-ul" />');
            "" != $(this).val() && function (t) {
                try {
                    JSON.parse(t)
                } catch (t) {
                    return !1
                }
                return !0
            }($(this).val()) && $.each(jQuery.parseJSON($(this).val()), function (t, e) {
                a.append($('<li class="multiple_emails-email"><span class="email_name" data-email="' + e.toLowerCase() + '">' + e + "</span></li>"));
                a.find('li:eq(' + t + ')').append($(c).click(function (k) {
                    $(this).parent().remove(), l(), k.preventDefault()
                }));
            });
            let t = $('<input type="email" data-id="' + $(this).attr('id') + '" autocomplete="off" class="multiple_emails-input text-left" />').on("keyup", function (t) {
                let e;
                $(this).removeClass("multiple_emails-error"), $(this).val().length, window.event ? e = t.keyCode : t.which && (e = t.which), 9 == e || 32 == e || 188 == e || 13 == e ? o($(this), n.checkDupEmail) : 13 == e && (o($(this), n.checkDupEmail));
                $(t.target).typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1,
                    source: typeaheadJson,
                    items: 6,
                    autoSelect: false,
                    fitToElement: true,
                })
            }).on("blur", function (t) {
                "" != $(this).val() && o($(this), n.checkDupEmail)
            }), e = $('<div class="multiple_emails-container" />').click(function () {
                t.focus();
            });

            function o(t, e) {
                let o = t.val().trim().replace(/^,|,$/g, "").replace(/^;|;$/g, "");
                o = (o = o.replace(/"/g, "")).split(/[\s,;]+/);
                for (let n = new Array, i = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i), r = 0; r < o.length; r++) !0 === e && -1 != s.val().indexOf(o[r]) ? o[r] && 0 < o[r].length && new function () {
                    let t = a.find(".email_name[data-email=" + o[r].toLowerCase().replace(".", "\\.").replace("@", "\\@") + "]");
                    t.css({"font-weight": "bold", color: "red"}), setTimeout(function () {
                        t.css({"font-weight": "", color: "black"})
                    }, 1e3)
                } : 1 == i.test(o[r]) ? a.append($('<li class="multiple_emails-email"><span class="email_name" data-email="' + o[r].toLowerCase() + '">' + o[r] + "</span></li>").prepend($(c).click(function (t) {
                    $(this).parent().remove(), l(), t.preventDefault()
                }))) : n.push(o[r]);
                0 < n.length ? t.val(n.join("; ")).addClass("multiple_emails-error") : t.val(""), l()
            }

            function l() {
                let t = new Array;
                s.siblings(".multiple_emails-container").find(".multiple_emails-email span.email_name").each(function () {
                    t.push($(this).html())
                }), s.val(JSON.stringify(t)).trigger("change")
            }

            return "top" === n.position.toLowerCase() ? e.append(a).append(t).insertAfter($(this)) : e.append(t).append(a).insertBefore($(this)), $(this).hide()
        })
    },
        $("#to_mails").multiple_emails({position: "bottom"}),
        $("#cc_mails").multiple_emails({position: "bottom"}),
        $("#submit").on("click", function () {
            $("#mail_compose_form").valid() ? sendData($("#mail_data_url").val(), !1, {
                form: "mail_compose_form",
                dataTable: !1
            }) : '';
        })
}

/** Mail Composer Js End **/

/** Copy to ClipBoard **/
function clipBoard() {
    $(".copy").on('click', function () {
        let text = $(this).parent().find('.copy-text').text();
        $(this).parent().find('span.copied').remove();
        let $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
        $(this).after("<span class='copied'>Copied</span>").delay(1000).queue(function () {
            $('.copied').remove();
        });
    });
}

function setFilterCount(start) {
    let inputs = filterForm.find(':input'),
        filterCount = start || 0;

    inputs.filter('.form-control').not("input[type='hidden']").not("input[type='search']").each(function () {
        if ($(this).val().length) {
            filterCount++;
        }
    });
    inputs.filter('.custom-control-input').each(function () {
        if ($(this).is(':checked')) {
            filterCount++;
        }
    });

    $('#filterCount').text(filterCount);
}

function disableChangeBranch() {
    $('#changeBranch').addClass('d-none');
}

function getAjax(url, data, type) {
    return {
        url: url,
        type: type || 'POST',
        data: data,
        error: function (err) {
            let text = err.responseJSON ? err.responseJSON.message : err.responseText;
            errorBox({text: text});
        }
    };
}

function dateConstrain() {
    let fromDate = $('#from-date'),
        toDate = $('#to-date');

    fromDate.add(toDate).datepicker().on('changeDate', function () {
        let from = new Date(fromDate.datepicker('getDate')),
            to = new Date(toDate.datepicker('getDate'));

        if (from.getTime() > to.getTime()) {
            if ($(this).attr('id') === 'from-date')
                toDate.datepicker('update', fromDate.val());
            else
                fromDate.datepicker('update', toDate.val());
        }
    });
}

function periodConstrain(form) {
    form = form ? form : $('#form-filter');
    let fromDate = form.find('#from-date'),
        toDate = form.find('#to-date'),
        periods = form.find('#periods');

    periods.on('change', function () {
        let date = $(this).val();
        if (date !== 'custom') {
            if (date.includes('/')) {
                fromDate.val(date.split('/')[0]);
                toDate.val(date.split('/')[1]);
            } else {
                toDate.val(date);
            }
        }
    })

    fromDate.on('changeDate', function () {
        periods.selectpicker('val', 'custom');
    })

    toDate.on('changeDate', function () {
        periods.selectpicker('val', 'custom');
    })

}

function refreshUrl() {//removing url parameters
    let url = document.URL.split("?")[0];
    history.pushState({}, null, url);
}

function marginLabel(data) {
    let margin = parseFloat(data), badge;
    if (isNaN(margin))
        badge = "<small title='Not applicable' class='badge badge-pill badge-white font-small-1'>" + 'N/A' + "</small>";
    else if (margin <= 0)
        badge = "<small title='" + data + " %' class='badge badge-pill bg-danger-v4 font-small-1'>" + data + "%</small>";
    else if (margin > 70)
        badge = "<small title='" + data + " %' class='badge badge-pill bg-success-v4 font-small-1'>" + data + "%</small>";
    else if (margin > 30)
        badge = "<small title='" + data + " %' class='badge badge-pill bg-primary-v4 font-small-1'>" + data + "%</small>";
    else if (margin > 0)
        badge = "<small title='" + data + " %' class='badge badge-pill bg-warning-v4 font-small-1'>" + data + "%</small>";
    return badge;
}

function commissionLabel(data) {
    return "<small title='" + data + " %' class='badge badge-pill bg-primary-v4 font-small-1'>" + data + "%</small>";
}

function containerListFormat(summary) {
    let containerSummary = '',
        summaryLength = summary['list'].length;
    for (let cs = 0; cs < summaryLength; cs++) {
        containerSummary += '<small class="badge bg-danger-v4 badge-pill containers-btn-lbl font-small-1 mr-md-1">' + summary['list'][cs] + '</small>';
    }
    containerSummary += '<br><small class="badge bg-danger-v4 badge-pill containers-btn-lbl font-small-1 font-weight-bold">' + summary['count'] + '</small>';
    return containerSummary;
}

function isMinusZero(value) {
    return 1 / value === -Infinity;
}

function inputCorrection(element) {
    let isDefault;
    element.find("input.numeric,input.currency,input.decimal,input.integers").on('blur', function () {
        isDefault = $(this).data('default');
        if ($(this).val() === "" && (typeof isDefault === 'undefined' || isDefault))
            $(this).val(0);
    });
    element.find("input.numeric,input.currency,input.decimal,input.integers").on('keypress', function () {
        if (isMinusZero($(this).val())) {
            $(this).selectRange(1, 2);
        }
    });
}

function getCheckBox(id, label, className = 'dt-list', uniqueId = '') {
    return '<div class="custom-control custom-checkbox"><input id="' + uniqueId + id + '" name="data[]" value="' + id + '" type="checkbox" class="' + className + ' custom-control-input"><label class="pointer custom-control-label" for="' + uniqueId + id + '">' + label + '</label></div>';
}

function getDisabledCheckBox(slNo) {
    return '<div class="custom-control custom-checkbox"><input disabled type="checkbox" class="custom-control-input"><label class="custom-control-label" >' + slNo + '</label></div>';
}

function pushIds(callBack, model = 'invoice', limit = 20) {
    let ids = [];

    $("input.dt-list").filter(':checked').each(function () {
        ids.push($(this).val());
    });
    if (ids.length > 0) {
        if (callBack.name === 'bulkApproval' && ids.length > limit) {
            showToastr(' Choose maximum ' + limit, 'Please choose maximum ' + limit + ' ' + model + ' from table', 'error');
        } else {
            callBack(ids, model);
        }
    } else
        showToastr(' Choose at least One', 'Please choose minimum one ' + model + ' from table', 'error');
}

function bulkApproval(ids, model) {
    model = model || 'invoice';
    let options = {
        title: ids.length + ' ' + model + 's selected',
        text: "Are you sure to approve " + ids.length + ' ' + model + 's at a time',
        confirmText: 'Yes, Approve',
        confirmCallBack: bulkApprove

    };
    confirmBox(options, {ids: ids});

    function bulkApprove(data) {
        let url = window.location.pathname.split("list")[0] + 'bulk/' + model + '/approve';
        url = url.substring(1);
        backgroundPostData(url, data, callBackDataTables, {alert: 'alert'});
    }
}

function toggleCloseButton(condition) {
    if (condition) {
        $('button.close').addClass('hide');
        window.onbeforeunload = function () {
            return true;
        };

    } else
        $('button.close').removeClass('hide');
}

function printVoucherFunction(id, type, table) {
    let firstUrl = '',
        lastUrl = '/print',
        title = table.split(' ')[0];
    if (printVoucherObject.hasOwnProperty(type)) {
        if (type === 'FI') {
            lastUrl = '/normal/print';
        }
        firstUrl = printVoucherObject[type];
    } else if (printVoucherObject.hasOwnProperty(title)) {
        firstUrl = printVoucherObject[title];
    }
    if (firstUrl)
        window.open(firstUrl + id + lastUrl);
}

let printVoucherObject = {
    SI: '/invoice/supplier/', FI: '/invoice/final/',
    GSI: '/general/supplier/invoice/', GCI: '/general/customer/invoice/', MS: '/payroll/salary/monthly/',
    Payment: '/finance/voucher/payment/', IC: '/inter/company/', Container: '/deposit/',
    Internal: '/finance/voucher/internal/', Transfer: '/finance/voucher/transfer/', Stock: '/stock/purchase/',
    Terminal: '/transportation/accounting/terminal/', Maintenance: '/transportation/accounting/maintenance/'
};

// Journals Group Datatable
function journalsGroupDT(options) {

    let form = $(".journals-group-form").last(),
        container = form.closest('.jg-container'),
        title = 'Journals';

    selectPicker(form);
    datePicker(form);
    periodConstrain(form);

    let toDate = form.find('.to-date'), fromDate = form.find('.from-date'), period = form.find('.periods'),
        partyNo = form.find('.group-column'), master = form.find('.master:first');

    form.find('.journals-group-search').off('click').on('click', function () {
        let url = form.find('.data-id').val(),
            data = Object.assign(options, {period: period.val(), toDate: toDate.val()});
        period.selectpicker('destroy');
        if (fromDate.length > 0) {
            data = Object.assign(data, {fromDate: fromDate.val()});
        }
        processModalBody(url, false, journalsGroupDT, {data: data})
    });

    title = options.title;
    let t = container.find(".journalsGroupDataTable");
    //Init Datatable
    t.DataTable({
        bServerSide: false,
        iDisplayLength: 250,
        ordering: false,
        aLengthMenu: [[250, 500, 1000, -1], [250, 500, 1000, 'All']],
        buttons: dataTableExportButtons(title)
    });

    $('.split').off('click').on('click', function () {
        let q = {}, account = $(this).data('account');
        q.toDate = toDate.val();
        if (fromDate.length) {
            q.fromDate = fromDate.val();
            q.ob = true;
        }
        q.company = $(this).data('company');
        if (partyNo.val() === 'party_no')
            q.party_no = $(this).data('target');
        let name = __('Transactions') + ' ' + account;
        q.title = name;
        if ((account === 9015000 || account === 8024000) && $(this).data('group') === 0) {
            name = __('Group Transactions') + ' ' + account;
            groupTransactions(account, name, q);
        } else {
            transactions(account, name, q);
        }
    });
}

// To call group transactions query
function groupTransactions(account, name, q) {
    getDataInModal('finance/' + account + '/journal/group', name, journalsGroupDT, {
        buttons: false,
        data: q,
        method: 'POST',
        shrinkModal: true
    });
}

// To call transactions query
function transactions(account, name, q) {
    if (account === 7021500) {
        q.raw = [
            {
                column: 'booked',
                operator: '=',
                value: '0'
            },
            {
                column: 'voucher_type',
                operator: 'NOT IN',
                value: ['IN']
            },
        ];
        if (typeof q.type !== 'undefined') {
            let op = (q.type === 'wi') ? 'IN' : 'NOT IN';
            q.raw.push({
                column: 'voucher_type',
                operator: op,
                value: ['FI', 'HAWB', 'GCI', 'IN']
            })
        }
    } else if (account === 7035500) {
        if (typeof q.type !== 'undefined') {
            let op = (q.type === 'ns') ? 'IN' : 'NOT IN';
            q.raw = [{
                column: 'voucher_type',
                operator: op,
                value: ['INFI', 'INHAWB', 'INGCI']
            }];
        }
    }
    getDataInModal('finance/' + account + '/journal', name, journalsDT, {
        buttons: false,
        data: q,
        method: 'POST',
        shrinkModal: true
    });
}

// Journals Datatable
function journalsDT(options) {

    let form = $("#journals-form"),
        title = 'Journals';

    selectPicker(form);
    datePicker(form);
    periodConstrain(form);

    let toDate = form.find('#to-date'), fromDate = form.find('#from-date'), period = form.find('#periods');

    $('#journals-search').on('click', function () {
        let url = form.find('#data-id').val(),
            data = Object.assign(options, {period: period.val(), toDate: toDate.val()});
        period.selectpicker('destroy');
        if (fromDate.length > 0) {
            data = Object.assign(data, {fromDate: fromDate.val()});
        }
        processModalBody(url, false, journalsDT, {data: data})
    });

    if (typeof options === 'string')
        title = options;
    else if (typeof options === 'object')
        title = options.title;
    let t = $("#journalsDataTable");
    t.on('draw.dt', function () { // Opening Voucher Print
        let tr = t.find('tbody tr');
        tr.on("click", function () {
            let vt = $(this).data('vt'), id = $(this).data('id'), modelTitle = $(this).data('title').split(" ")[0];
            if (printVoucherObject.hasOwnProperty(vt) || printVoucherObject.hasOwnProperty(modelTitle)) {
                printVoucherFunction(id, vt, modelTitle);
            }
        });
    });

    //Init Datatable
    t.DataTable({
        bServerSide: false,
        iDisplayLength: 250,
        ordering: false,
        aLengthMenu: [[250, 500, 1000, -1], [250, 500, 1000, 'All']],
        buttons: dataTableExportButtons(title)
    });
}

function changeTax(ele) {
    $(ele).each(function () {
        let rate = $(this).find('option:selected').data('tax'), type = $(this).find('option:selected').data('tax-type');
        $(this).closest('tr').find('select.tax').selectpicker('val', rate + '*' + type);
    })
}

/* state codes */
function statesMethod(key = '', code = false) {
    //code=false?state name returned : check code exits or not
    if (code === true) {//to check state code exits
        return states.hasOwnProperty(key);
    } else {// to get state name using code
        return key !== '' ? states[key] : '';
    }
}

let states = {
    '01': 'JAMMU AND KASHMIR',
    '02': 'HIMACHAL PRADESH',
    '03': 'PUNJAB',
    '04': 'CHANDIGARH',
    '05': 'UTTARAKHAND',
    '06': 'HARYANA',
    '07': 'DELHI',
    '08': 'RAJASTHAN',
    '09': 'UTTAR PRADESH',
    '10': 'BIHAR',
    '11': 'SIKKIM',
    '12': 'ARUNACHAL PRADESH',
    '13': 'NAGALAND',
    '14': 'MANIPUR',
    '15': 'MIZORAM',
    '16':'TRIPURA',
    '17': 'MEGHALAYA',
    '18': 'ASSAM',
    '19': 'WEST BENGAL',
    '20': 'JHARKHAND',
    '21': 'ORISSA',
    '22': 'CHHATTISGARH',
    '23': 'MADHYA PRADESH',
    '24': 'GUJARAT',
    '25': 'DAMAN AND DIU',
    '26': 'DADRA AND NAGAR HAVELI',
    '27': 'MAHARASHTRA',
    '29': 'KARNATAKA',
    '30': 'GOA',
    '31': 'LAKSHADWEEP',
    '32': 'KERALA',
    '33': 'TAMIL NADU',
    '34': 'PUDUCHERRY',
    '35': 'ANDAMAN AND NICOBAR',
    '36': 'TELANGANA',
    '37': 'ANDHRA PRADESH',
    '38': 'LADAKH',
    '97': 'OTHER TERRITORY',
    '96': 'OTHER COUNTRY'
};

function changeCustomerGstTreatment(treatment, gstNumber, state) {
    gstNumber.closest('.form-group').find('label i').remove();
    if (treatment == 4) {
        state.val("96").attr('disabled', 'disabled').selectpicker('refresh');
    } else {
        state.removeAttr('disabled').selectpicker('refresh');
    }
    if (treatment == 2 || treatment == 3 || treatment == 4) {
        gstNumber.val('');
        gstNumber.attr('disabled', 'disabled');
        gstNumber.removeAttr('required');
        gstNumber.closest('.form-group').find('label i').remove();
        gstNumber.closest('.form-group').removeClass('error');
        gstNumber.closest('.form-group').find('label.error').remove();
    } else {
        gstNumber.removeAttr('disabled');
        gstNumber.attr('required', 'required');
        gstNumber.closest('.form-group').find('label').append('<i class="fa fa-asterisk"></i>');
    }
}

function toFixedCustom(amount, precision = 2) {
    return accounting.toFixed(amount, precision);
}
