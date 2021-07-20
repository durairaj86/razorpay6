function calculateTaxRow(getTaxableAmount, options) {
    let defaults = {
        tbodyId: $("#expense-tbody tr"),
        adjustment: false,
        tdColspan: 5,
        rowCalculation: false,
        discountOption: false,
        appendGst: '#sub-total',
        taxInc: false,
        taxSelect: 0,
        reverseCharge: false,
        subTotal: true,
        remainingBox: false
    };
    jQuery.extend(defaults, options);
    let taxOption = [],
        taxType = [],
        subTotalAmt = 0, taxableAmount = 0, totalTaxableAmount = 0, rowAmount = 0;

    defaults.tbodyId.each(function () {
        let elem = $(this),
            getTaxId = elem.find('select.tax-option option:selected').val(),
            taxGroup = getGstType(getTaxId),
            receiveAmount = getAmount(getTaxableAmount(elem), elem, taxGroup, defaults),
            taxSplit, taxGroupType, type, taxRate;

        if (taxGroup[0]) {
            taxRate = taxGroup[0].rate;
            taxSplit = taxGroup[0].rate.split('*');
            taxGroupType = taxGroup[0].type.split('*');
        }

        taxableAmount = receiveAmount[0];
        subTotalAmt = (parseFloat(subTotalAmt) + parseFloat(receiveAmount[1]));
        totalTaxableAmount = (parseFloat(totalTaxableAmount) + parseFloat(taxableAmount));
        rowAmount = receiveAmount[1];
        if (defaults.rowCalculation) {//For Row Calculation
            rowCalculation(elem, rowAmount);
        }
        if (taxSplit) {
            let typeOption = taxSplit.length;

            for (let j = 0; j < typeOption; j++) {
                type = taxGroupType[j];
                let typeValue = type + '-' + taxSplit[j];
                if (taxOption[typeValue]) {
                    let key = taxType.findIndex(x => (x.type === type && x.rate === taxSplit[j]));
                    taxType[key].taxAmount += getTaxAmount(type, taxSplit[j], taxRate, taxableAmount, defaults);
                    taxType[key].rowCount += 1;
                } else {
                    taxOption[typeValue] = 1;
                    taxType.push({
                        type: type,
                        rate: taxSplit[j],
                        toRate: taxSplit,
                        rowCount: 1,
                        taxAmount: getTaxAmount(type, taxSplit[j], taxRate, taxableAmount, defaults)
                    });
                }
            }
        }
    });

    let taxAmount = '';
    if (defaults.reverseCharge) {
        taxAmount = reverseCharge(taxOption, taxType, defaults);
    } else {
        taxAmount = setTaxTotal(taxOption, taxType, defaults);
    }
    setGstAmount(subTotalAmt, taxAmount, defaults, totalTaxableAmount);
}

function getGstType(taxId) {
    let taxValueArray = [];
    let taxDetails = TAXES.filter(function (tax) {
        return tax.id == taxId;
    });
    let taxValue = taxDetails[0],
        newRate = '', newType = '';
    if (taxValue) {
        if (taxValue.grouped === 1) {
            let groupTax = taxValue.group_tax;
            for (let j = 0; j < groupTax.length; j++) {
                if (newRate) {
                    newRate = newRate + '*' + groupTax[j].rate;
                    newType = newType + '*' + groupTax[j].type;
                } else {
                    newRate = groupTax[j].rate;
                    newType = groupTax[j].type;
                }
            }
        } else {
            newRate = taxValue.rate;
            newType = taxValue.type;
        }
        taxValueArray.push({
            rate: newRate,
            type: newType,
        })
        return taxValueArray;
    } else {
        return false;
    }
}

function reverseCharge(taxOption, taxType, defaults) {
    if ($("input[name='reverse_charge']").is(":checked")) {
        $('.gst-row').remove();
        if (!defaults.subTotal)
            $('#sub-total').addClass('d-none');
        return 0;
    } else {
        $('#sub-total').removeClass('d-none');
        return setTaxTotal(taxOption, taxType, defaults);
    }
}

function getTaxAmount(type, rate, typeRate, amount, defaults) {
    let taxSplit = typeRate.split('*'), taxPercentAmount, taxPercent;
    if (defaults.taxInc && defaults.taxSelect === '1') {
        let taxPercentage = 0;
        for (let k = 0; k < (taxSplit.length); k++) {
            taxPercentage += parseFloat(taxSplit[k]);
        }
        if (taxSplit.length > 1) {
            if (!defaults.discountOption) {
                taxPercentAmount = ((parseFloat(amount) - (parseFloat(amount) * (100 / (100 + parseFloat(taxPercentage)))))) / taxPercentage;
            } else {
                taxPercentAmount = parseFloat(amount) / 100;
            }
            taxPercent = parseFloat(taxPercentAmount) * parseFloat(rate);// Tax Inclusive
        } else {
            if (!defaults.discountOption) {
                taxPercent = parseFloat(amount) - (parseFloat(amount) * (100 / (100 + parseFloat(rate))));
            } else {
                taxPercent = ((amount * rate) / 100);
            }
        }
    } else {
        taxPercent = ((amount * rate) / 100);
    }

    return taxPercent;
}

function getAmount(receiveAmount, elem, taxGroup, defaults) {
    let taxableAmount = 0, newReceiveAmount;
    if (defaults.discountOption) {//For Bills
        let typeOfDiscount = $('#type-of-discount').val();
        if (typeOfDiscount === '0') {
            let getDiscountAmt = getDiscountCalc(defaults, taxGroup);
            let receiveAmountChange = getTaxableAmount(defaults, elem, taxGroup);
            newReceiveAmount = [receiveAmountChange, receiveAmountChange - (receiveAmountChange * getDiscountAmt)];
        }
    }
    if ($.isArray(newReceiveAmount)) {
        if (isNaN(newReceiveAmount[1])) {
            taxableAmount = newReceiveAmount[0];
        } else {
            taxableAmount = newReceiveAmount[1];
        }
    } else {
        taxableAmount = receiveAmount;
    }
    return [taxableAmount, receiveAmount];
}

function rowCalculation(elem, amount) {
    elem.find('.row-total').text(toFixedCustom(parseFloat(amount),2));
}

function setTaxTotal(taxOption, taxType, defaults) {

    let subTotalId = $('#sub-total'),
        refreshGst = true, taxAmount = 0, taxTypeObj, setTax = [];

    for (let i = 0, l = taxType.length; i < l; i++) {
        taxTypeObj = taxType[i];
        if (taxTypeObj.type) {
            setGstLayout(taxTypeObj, refreshGst, defaults);
            refreshGst = false;
        }
        let typeValue = taxTypeObj.type + '-' + taxTypeObj.toRate;
        if (setTax[typeValue] && taxTypeObj.rowCount === 1) {
            taxAmount += 0;
        } else {
            taxAmount += taxTypeObj.taxAmount;
            setTax[typeValue] = 1;
        }
    }

    subTotalId.removeClass('d-none');
    return taxAmount;
}

function setGstLayout(taxTypeObj, refreshGst, defaults) {
    let type = taxTypeObj.type,
        rate = taxTypeObj.rate,
        expenseFoot = $('.tax-tfoot'),
        className = (type + rate).toString(),
        taxPercent = taxTypeObj.taxAmount;

    if (refreshGst) {
        expenseFoot.find('tr.gst-row').remove();
    }
    expenseFoot.find('tr.' + className).remove();
    let lay = '',
        taxCharge = 0;

    if (!isNaN(taxPercent)) {
        lay += '<tr class="gst-row ' + className + ' text-right">\n' +
            '                            <td colspan="' + defaults.tdColspan + '"></td>\n' +
            '                            <td class="font-bold">' + type + ' [' + toFixedCustom(parseFloat(rate),2) + '%]</td>\n' +
            '                            <td class="text-right">\n' + toFixedCustom(taxPercent,2) + '</td>\n' +
            '                        </tr>';
        taxCharge += taxPercent;

        expenseFoot.find(defaults.appendGst).after(lay);
    }
    return taxCharge;
}

function setGstAmount(subTotalAmt, totalTaxAmount, defaults, totalTaxableAmount) {
    let discount = $('#discount').val();
    let discountAmt = isNaN(discount) ? 0 : discount ? discount : 0;
    $("#sub-total-amount").html(toFixedCustom(parseFloat(subTotalAmt),2));
    if (defaults.discountOption === 'before_tax' && defaults.taxSelect === '1') {
        subTotalAmt = (parseFloat(totalTaxableAmount) + parseFloat(totalTaxAmount));
    } else if (defaults.discountOption === 'after_tax' && defaults.taxSelect === '1') {
        subTotalAmt = (parseFloat(subTotalAmt) - parseFloat(discountAmt));
    } else if (defaults.discountOption === 'before_tax') {
        subTotalAmt = (parseFloat(subTotalAmt) - parseFloat(discountAmt) + parseFloat(totalTaxAmount));
    } else if (defaults.discountOption === 'after_tax') {
        subTotalAmt = (parseFloat(subTotalAmt) + parseFloat(totalTaxAmount) - parseFloat(discountAmt));
    }
    if (!defaults.discountOption) {
        if (defaults.taxSelect === '1') {
            subTotalAmt = parseFloat(subTotalAmt);
        } else {
            subTotalAmt = parseFloat(subTotalAmt) + parseFloat(totalTaxAmount);
        }
    }
    if (defaults.adjustment) {//For Adjustment Amount
        let adjustmentAmount = $("#adjustment").val();
        if (!isNaN(adjustmentAmount) && adjustmentAmount) {
            subTotalAmt = parseFloat(subTotalAmt) + parseFloat(adjustmentAmount);
        }
    }
    if(defaults.remainingBox){
        let gross_amount = $("#gross_amount").val();
        if(gross_amount<0){
            gross_amount = 0;
        }
        $("#remaining").val(toFixedCustom((subTotalAmt - parseFloat(gross_amount)), 2));
    }
    $("#total-inc-tax").html(toFixedCustom(subTotalAmt, 2));
}

function getDiscountCalc(defaults, taxGroup) {
    let taxableAmount = 0,
        totalTaxableAmount = 0,
        discountPerCost = 0,
        tbodyId = defaults.tbodyId,
        discount = $('#discount').val(),
        taxPercent = 0;

    tbodyId.each(function () {
        let thisEle = $(this);
        let quantity = thisEle.find('input.quantity').val();
        let cost = thisEle.find('input.price').val();
        let totalAmount = (quantity * parseFloat(cost)),
            taxSplit = [];
        if (taxGroup[0]) {
            taxSplit = taxGroup[0].rate.split('*');
        }

        if (defaults.taxInc && defaults.taxSelect === '1') {
            let taxPercentage = 0;
            for (let k = 0; k < (taxSplit.length); k++) {
                taxPercentage += parseFloat(taxSplit[k]);
            }
            if (taxSplit.length > 1) {
                taxableAmount = ((parseFloat(totalAmount) * 100) / (100 + parseFloat(taxPercentage)));
            } else {
                taxableAmount = ((parseFloat(totalAmount) * 100) / (100 + parseFloat(taxSplit[0])));
            }
            totalTaxableAmount += taxableAmount;
        } else {
            taxableAmount = totalAmount;
            totalTaxableAmount += totalAmount;
        }
    });

    if (discount > 0) {
        discountPerCost = discount / totalTaxableAmount;
    }
    return discountPerCost;
}

function getTaxableAmount(defaults, elem, taxGroup) {
    let taxableAmount,
        taxPercent = 0;
    let thisEle = elem;
    let quantity = thisEle.find('input.quantity').val();
    let cost = thisEle.find('input.price').val();
    let totalAmount = (quantity * parseFloat(cost)),
        taxSplit;
    if (taxGroup[0]) {
        taxSplit = taxGroup[0].rate.split('*');
    }
    if (taxSplit) {
        if (defaults.taxInc && defaults.taxSelect === '1') {
            let taxPercentage = 0;
            for (let k = 0; k < (taxSplit.length); k++) {
                taxPercentage += parseFloat(taxSplit[k]);
            }
            if (taxSplit.length > 1) {
                taxableAmount = ((parseFloat(totalAmount) * 100) / (100 + parseFloat(taxPercentage)));
            } else {
                taxableAmount = ((parseFloat(totalAmount) * 100) / (100 + parseFloat(taxSplit[0])));
            }
        } else {
            taxableAmount = totalAmount;
        }
        return taxableAmount;
    } else {
        return totalAmount;
    }
}
