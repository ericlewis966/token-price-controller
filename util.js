const BigNumber = require('bignumber.js');
const { ethers } = require('ethers');
const notifier = require('node-notifier');

function toSafeNumber(originNumber, decimals) {
    if (originNumber == 0 || originNumber == '0') {
        return 0;
    }
    const bigBalance = new BigNumber(originNumber.toString());
    const denom = new BigNumber(10).pow(decimals);
    const safeBalance = bigBalance.dividedBy(denom).toNumber();

    return safeBalance;
}

function toBigNumber(originNumber, decimals) {
    return ethers.utils.parseUnits(String(originNumber), decimals);
}

function notify(price, change, charge) {
    notifier.notify({
        'title': 'Fido price & community charge changed',
        'Fido Status': 'Fido Statement Notifier',
        'message': `Current FIDO price is $${price}, changeValue is ${change}%, community_charge is ${charge}%`,
        'wait': false,
        'sound': true,
        'icon': './icon/fidometa.jpg',
        'time': 60000,
        'timeout': 5
    })
}

exports.toSafeNumber = toSafeNumber;
exports.toBigNumber = toBigNumber;
exports.notify = notify;