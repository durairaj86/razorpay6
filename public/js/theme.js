const $sidebar = $('#app-sidebar'),
    $sidebar_content = $('#sidebar-content'),
    $sidebar_img = $sidebar.data('image'),
    $sidebar_img_container = $('#sidebar-background'),
    $wrapper = $('#wrapper'), $body = $('body'),
    navToggle = $("#sidebarToggle");

let mainContent = $('#main-content'), rightBar = $('#right-bar'), rightBarToggle = $('#rightbar-toggle');

$(function () {
    // Scroll To Active
    if ($('.navigation-main').data('scroll-to-active') === true) {
        let position;
        if ($('.navigation-main').find('li.active').parents('li').length > 0) {
            position = $(".navigation-main").find('li.active').parents('li').last().position();
        } else {
            position = $(".navigation-main").find('li.active').position();
        }
        setTimeout(function () {
            if (position !== undefined) {
                $('.sidebar-content.ps-container').animate({
                    scrollTop: position.top
                }, 300)
            }
        }, 300)
    }

    /*$sidebar_content.mouseenter(function(){

    });*/

    $sidebar_content.slimScroll({
        height:"90vh",
    });

    if ($sidebar_img_container.length !== 0 && $sidebar_img !== undefined) {
        $sidebar_img_container.css('background-image', 'url("' + getUrl()+$sidebar_img + '")');
    }

    if (!$wrapper.hasClass('nav-collapsed')) {
        $sidebar_content.find('li.active').parents('li').addClass('open');
    }


    $sidebar_content.on('click', '.navigation li a', function () {
        let $this = $(this),
            listItem = $this.parent('li');

        if (listItem.hasClass('has-sub') && listItem.hasClass('open')) {
            collapse(listItem);
        } else {
            if (listItem.hasClass('has-sub')) {
                expand(listItem);
            }

            // If menu collapsible then do not take any action
            if ($sidebar_content.data('collapsible')) {
                return false;
            }
            // If menu accordion then close all except clicked once
            else {
                openListItems = listItem.siblings('.open');
                collapse(openListItems);
                listItem.siblings('.open').find('li.open').removeClass('open');
            }
        }
    });

    function collapse($listItem, callback) {
        let $subList = $listItem.children('ul');
        $subList.show().slideUp(200, function () {
            $(this).css('display', '');
            $(this).find('> li').removeClass('is-shown');
            $listItem.removeClass('open');
            if (callback) {
                callback();
            }
        });
    }

    function expand($listItem, callback) {
        let $subList = $listItem.children('ul');
        let $children = $subList.children('li').addClass('is-hidden');
        $listItem.addClass('open');
        $subList.hide().slideDown(200, function () {
            $(this).css('display', '');
            if (callback) {
                callback();
            }
        });
        setTimeout(function () {
            $children.addClass('is-shown');
            $children.removeClass('is-hidden');
        }, 0);
    }

    navToggle.on("click", function () {
        let $this = $(this),
            toggle_icon = $this.find('.toggle-icon'),
            toggle = toggle_icon.attr('data-toggle'),
            compact_menu_checkbox = $('#cz-compact-menu'),
            compact = 1
        ;
        if (toggle === 'expanded') {
            $wrapper.addClass('nav-collapsed menu-collapsed').removeClass('sidebar-sm sidebar-lg');
            navToggle.find('.toggle-icon').removeClass('ft-toggle-right').addClass('ft-toggle-left');
            toggle_icon.attr('data-toggle', 'collapsed');
            if (compact_menu_checkbox.length > 0) {
                compact_menu_checkbox.prop('checked', true);
            }
            $('.navigation li.open').addClass('nav-collapsed-open').removeClass('open');
        } else {
            $wrapper.removeClass('nav-collapsed menu-collapsed').addClass('sidebar-sm');
            navToggle.find('.toggle-icon').removeClass('ft-toggle-left').addClass('ft-toggle-right');
            toggle_icon.attr('data-toggle', 'expanded');
            if (compact_menu_checkbox.length > 0) {
                compact_menu_checkbox.prop('checked', false);
            }
            compact = 0;
            $('.navigation li.nav-collapsed-open').addClass('open').removeClass('nav-collapsed-open');
            rightBarClose();
        }
        backgroundPostData('settings/theme/compact/'+compact,false,false);
    });

    // For dark layout
    $('#dark-light').on('click', function () {
        let layout = 1;
        if ($body.hasClass('layout-dark')) {
            layout = 0;
            localStorage.setItem('layout', 'light');
        } else {
            localStorage.setItem('layout', 'dark');
        }
        $body.toggleClass('layout-dark');
        backgroundPostData('settings/theme/layout/'+layout,false,false);
    })

    $sidebar.on('mouseenter', function () {
        if ($wrapper.hasClass('nav-collapsed')) {
            $wrapper.removeClass('menu-collapsed');
            let $listItem = $('.navigation li.nav-collapsed-open'),
                $subList = $listItem.children('ul');

            $subList.hide().slideDown(300, function () {
                $(this).css('display', '');
            });

            $sidebar_content.find('li.active').parents('li').addClass('open');
            $listItem.addClass('open').removeClass('nav-collapsed-open');
        }
    }).on('mouseleave', function (event) {
        if ($wrapper.hasClass('nav-collapsed')) {
            $wrapper.addClass('menu-collapsed');
            let $listItem = $('.navigation li.open'),
                $subList = $listItem.children('ul');
            $listItem.addClass('nav-collapsed-open');

            $subList.show().slideUp(300, function () {
                $(this).css('display', '');
            });

            $listItem.removeClass('open');
        }
    });

    if ($(window).width() < 992) {
        $sidebar.addClass('hide-sidebar');
        $wrapper.removeClass('nav-collapsed menu-collapsed');
    }

    $(window).resize(function () {
        if ($(window).width() < 992) {
            $sidebar.addClass('hide-sidebar');
            $wrapper.removeClass('nav-collapsed menu-collapsed');
            rightBarClose();
        }
        if ($(window).width() > 992) {
            $sidebar.removeClass('hide-sidebar');
            $wrapper.addClass('nav-collapsed menu-collapsed');
        }
    });

    $(document).on('click', '.navigation li:not(.has-sub)', function () {
        if ($(window).width() < 992) {
            $sidebar.addClass('hide-sidebar');
        }
    });

    $('.dropdown-menu.keep-open').on('click',function(e) {
        e.stopPropagation();
    });

    $('#minNavbar').on('click', function (e) {
        e.stopPropagation();
        $sidebar.toggleClass('hide-sidebar');
    });

    $('html').on('click', function (e) {
        if ($(window).width() < 992) {
            if (!$sidebar.hasClass('hide-sidebar') && $sidebar.has(e.target).length === 0) {
                $sidebar.addClass('hide-sidebar');
            }
        }
    });

    $('#sidebarClose').on('click', function () {
        $sidebar.addClass('hide-sidebar');
    });

    // Page full screen
    let navBarFullScreen = $('#navbar-fullscreen');
    navBarFullScreen.on('click', function (e) {
        if (typeof screenfull != 'undefined') {
            if (screenfull.enabled) {
                screenfull.toggle();
            }
        }
    });
    if (typeof screenfull != 'undefined') {
        if (screenfull.enabled) {
            $(document).on(screenfull.raw.fullscreenchange, function () {
                if (screenfull.isFullscreen) {
                    navBarFullScreen.find('i').toggleClass('ft-minimize ft-maximize');
                } else {
                    navBarFullScreen.find('i').toggleClass('ft-maximize ft-minimize');
                }
            });
        }
    }

    /********************************
     *           Customizer          *
     ********************************/
    // Customizer toggle & close button click events  [Remove customizer code from production]
    /*$('.notification-sidebar-toggle').on('click', function () {
        $('.notification-sidebar').toggleClass('open');
    });*/
    $('#notification-sidebar-close').on('click', function () {
        floatBarToggle();
    });
    $('.open-navbar-container').on('click', function () {
        $('.navbar-collapse').toggleClass('show');
    });

    if ($('#floatbar-content').length > 0) {
        $("#floatbar-content").slimScroll({
            height:'90vh'
        });
    }

    // Right Bar
    function rightBarClose()
    {
        let e = rightBar.addClass('right-bar-close');
        mainContent.addClass('pr-0');
        rightBarToggle.addClass('right-bar-pull');
        rightBarToggle.find('i').toggleClass('rotate-180');
        localStorage.setItem('rightBarClose',e.hasClass('right-bar-close'));
    }
    if(localStorage.getItem('rightBarClose') === "true"){
        rightBar.addClass('right-bar-close');
        mainContent.addClass('pr-0');
        rightBarToggle.toggleClass('right-bar-pull');
    }
    rightBarToggle.on('click',function () {
        let e = rightBar.toggleClass('right-bar-close');
        mainContent.toggleClass('pr-0');
        $(this).toggleClass('right-bar-pull');
        rightBarToggle.find('i').toggleClass('rotate-180');
        localStorage.setItem('rightBarClose',e.hasClass('right-bar-close'));
    });

});

/********************************
 *           Customizer          *
 ********************************/
function themeCustomizer()
{
    let default_bg_color = $sidebar.attr("data-background-color"),
        default_bg_image = $sidebar.attr("data-image");

    $('#cz-bg-color span[data-bg-color="' + default_bg_color + '"]').addClass(
        "selected"
    );
    $('#cz-bg-image img[data-src$="' + default_bg_image + '"]').addClass("selected");

    if($('#cz-bg-image img[data-src$="' + default_bg_image + '"]').length)
        $("#sidebar-bg-img").prop('checked', true);

    // Customizer toggle & close button click events  [Remove customizer code from production]
    /*$("#customizer-toggle-icon").on("click", function () {
        $(".customizer").toggleClass("open");
    });*/
    if ($(".customizer-content").length > 0) {
        $(".customizer-content").slimScroll({
            height: "90vh"
        });
    }

    // Layout Config
    if ($("body.layout-dark").length > 0) {
        $(".layout-switch")
            .find(".dark-layout #dl-switch")
            .attr("checked", true);
        $(".sb-color-options")
            .find(".gradient-man-of-steel")
            .removeClass("selected");
        $(".sb-color-options")
            .find(".bg-black")
            .addClass("selected");
    }
    if ($("body.layout-dark.layout-transparent").length > 0) {
        $(".layout-switch")
            .find(".dark-layout #dl-switch")
            .attr("checked", false);
        $(".layout-switch")
            .find(".transparent-layout #tl-switch")
            .attr("checked", true);

        $("#dl-switch").on("click", function () {
            $sidebar.attr("data-background-color", "black");
        });
        $("#ll-switch").on("click", function () {
            $sidebar_img_container.css(
                "background-image",
                "img/sidebar-bg/01.jpg"
            );
        });
    }

    // Change Sidebar Background Color
    $(".cz-bg-color span").on("click", function () {
        let $this = $(this),
            bgColor = $this.attr("data-bg-color");
        $this
            .closest(".cz-bg-color")
            .find("span.selected")
            .removeClass("selected");
        $this.addClass("selected");
        $sidebar.attr("data-background-color", bgColor);
    });

    // Change Background Image
    $("#cz-bg-image img").on("click", function () {
        let $this = $(this),
            src = $this.attr("src");
        $sidebar_img_container.css("background-image", "url(" + src + ")");
        $this
            .closest(".cz-bg-image")
            .find(".selected")
            .removeClass("selected");
        $this.addClass("selected");
        $("#sidebar-bg-img").prop('checked',true);
    });

    // BG Toggle
    $("#sidebar-bg-img").on("click", function () {
        let $this = $(this);
        let src = $("#cz-bg-image img.sb-bg-01").data("src");
        let srcVal = '';
        if ($this.prop("checked") === true) {
            $sidebar_img_container.css("background-image", "url(" + getUrl() + src + ")");
            $("#cz-bg-image img.sb-bg-01").addClass("selected");
            srcVal = src;
        } else {
            $sidebar_img_container.css("background-image", "none");
        }
        $("#sidebar-bg").val(srcVal);
    });

    // Compact Menu
    $("#cz-compact-menu").on("click", function () {
        navToggle.trigger("click");
        if ($(this).prop("checked") === true) {
            $sidebar.trigger("mouseleave");
        }
    });

    // To toggle sidebar image checkbox
    $("#sidebar-bg-img").on("click", function () {
        if ($(this).is(":checked")) {
            $(this).removeAttr("checked", false);
        } else {
            $(this).attr("checked", true);
            $(".sb-bg-img img.selected").removeClass("selected");
        }
    });

    // To Toggle Light Layout
    $("#ll-switch").on("click", function () {
        // Removes Layout Dark and Transparent Classes
        $body.removeClass(
            "layout-transparent layout-dark bg-hibiscus bg-purple-pizzazz bg-blue-lagoon bg-electric-violet bg-portage bg-tundora bg-glass-1 bg-glass-2 bg-glass-3 bg-glass-4"
        );
        $(".sb-color-options")
            .find(".selected")
            .removeClass("selected");
        $(".sb-color-options")
            .find(".gradient-man-of-steel")
            .addClass("selected");
        // Selected Image
        let src = $(".cz-bg-image img.sb-bg-01").attr("src");
        $sidebar_img_container.css("background-image", "url(" + getUrl() + src + ")");
        $sidebar.css("background-image", "url(" + src + ")");

        // Selected Background Color
        let bgColor = $(".cz-bg-color span.selected").attr("data-bg-color");
        $sidebar.attr("data-background-color", bgColor);
    });

    // To Toggle Dark Layout
    $("#dl-switch").on("click", function () {
        // Removes Unwanted Classes if any and adds layout-dark to body
        if ($body.hasClass("layout-transparent")) {
            $body.removeClass(
                "layout-transparent bg-hibiscus bg-purple-pizzazz bg-blue-lagoon bg-electric-violet bg-portage bg-tundora bg-glass-1 bg-glass-2 bg-glass-3 bg-glass-4"
            );
            $body.addClass("layout-dark");
            $sidebar_img_container.css(
                "background-image",
                "url(" + getUrl() + "/img/sidebar-bg/01.jpg)"
            );
            $sidebar.attr("data-background-color", "black");
        } else {
            $body.toggleClass("layout-dark");
            $(".sb-color-options span.selected").removeClass("selected");
            $(".sb-color-options .bg-black").addClass("selected");
            $sidebar.attr("data-background-color", "black");
            $(".logo-img img").attr("src", getUrl() + "/img/logo.png");
        }
    });

    // Theme Customization
    themeCustomization();

    function themeCustomization() {
        let themeForm = $("#theme-form");
        themeForm.find("#customizer-submit").on('click', function (e) {
            let color = $("#cz-bg-color").find('span.selected').data('bg-color');
            $("#sidebar-color").val(color);
            let img = $("#cz-bg-image").find('img.selected').data('src');
            $("#sidebar-bg").val(img);
            sendData(getUrl()+'settings/theme', false,{ form:'theme-form',alert:'toastr',dataTable:false,submitBtnId: 'customizer-submit'});
        });
    }
}