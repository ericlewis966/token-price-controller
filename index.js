/*Project Config*/
require('dotenv').config();
/*WebSocket & Ethers.JS library*/
const WebSocket = require('ws');
const { ethers } = require('ethers');
/*Utility library & function*/
const { toSafeNumber } = require('./util');
const { toBigNumber } = require('./util');
const { notify } = require('./util');
/*Socket config & contract ABI*/
const { requestMsg } = require('./config');
const ABI = require('./ABI.json');

/*Provider, Signer, Contract, and WalletSignedContract Define*/
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.TOKEN_ADDRESS, ABI.abi, signer);
const signedContract = contract.connect(signer);

/*Token sevice charges*/
var communityCharge, ecoSysFee, surCharge1, surCharge2, surCharge3, lastCommunityCharge, decimals;

async function getCharges() {
    decimals = await signedContract.decimals();

    const _community_charge = await signedContract._community_charge();
    const _ecoSysFee = await signedContract._ecoSysFee();
    const _surcharge1 = await signedContract._surcharge1();
    const _surcharge2 = await signedContract._surcharge2();
    const _surcharge3 = await signedContract._surcharge3();

    communityCharge = toSafeNumber(_community_charge, decimals);
    ecoSysFee = toSafeNumber(_ecoSysFee, 8);
    surCharge1 = toSafeNumber(_surcharge1, 8);
    surCharge2 = toSafeNumber(_surcharge2, 8);
    surCharge3 = toSafeNumber(_surcharge3, 8);
}

async function txControll(data) {
    if (data.tick.change > -10) {
        if (lastCommunityCharge == 2.5) {
            return;
        } else {
            const tx = await signedContract.setCharges(toBigNumber(2.5, decimals), toBigNumber(ecoSysFee, 8), toBigNumber(surCharge1, 8), toBigNumber(surCharge2, 8), toBigNumber(surCharge3, 8));
            await tx.wait();
            lastCommunityCharge = 2.5;
            notify(data.tick.usd, data.tick.change, lastCommunityCharge);
        }
    }
    if (data.tick.change <= -10 && data.tick.change > -15) {
        if (lastCommunityCharge == 15) {
            return;
        } else {
            const tx = await signedContract.setCharges(toBigNumber(15, decimals), toBigNumber(ecoSysFee, 8), toBigNumber(surCharge1, 8), toBigNumber(surCharge2, 8), toBigNumber(surCharge3, 8));
            await tx.wait();
            lastCommunityCharge = 15;
            notify(data.tick.usd, data.tick.change, lastCommunityCharge);
        }
    }

    if (data.tick.change <= -15 && data.tick.change > -20) {
        if (lastCommunityCharge == 20) {
            return;
        } else {
            const tx = await signedContract.setCharges(toBigNumber(20, decimals), toBigNumber(ecoSysFee, 8), toBigNumber(surCharge1, 8), toBigNumber(surCharge2, 8), toBigNumber(surCharge3, 8));
            await tx.wait();
            lastCommunityCharge = 20;
            notify(data.tick.usd, data.tick.change, lastCommunityCharge);
        }
    }
    if (data.tick.change <= -20 && data.tick.change > -25) {
        if (lastCommunityCharge == 25) {
            return;
        } else {
            const tx = await signedContract.setCharges(toBigNumber(25, decimals), toBigNumber(ecoSysFee, 8), toBigNumber(surCharge1, 8), toBigNumber(surCharge2, 8), toBigNumber(surCharge3, 8));
            await tx.wait();
            lastCommunityCharge = 25;
            notify(data.tick.usd, data.tick.change, lastCommunityCharge);
        }
    }
    if (data.tick.change <= -25) {
        if (lastCommunityCharge == 40) {
            return;
        } else {
            const tx = await signedContract.setCharges(toBigNumber(25, decimals), toBigNumber(ecoSysFee, 8), toBigNumber(surCharge1, 8), toBigNumber(surCharge2, 8), toBigNumber(surCharge3, 8));
            await tx.wait();
            lastCommunityCharge = 40;
            notify(data.tick.usd, data.tick.change, lastCommunityCharge);
        }
    }
}

async function run() {
    await getCharges();
    const socket = new WebSocket(process.env.SOCKET_SERVER);

    console.log(requestMsg, process.env.SOCKET_SERVER);

    socket.on('open', () => {
        setInterval(() => {
            if (socket.isPaused) {
                socket.resume();
            }
            socket.send(JSON.stringify(requestMsg));
        }, 60000);
    })

    socket.on('message', (data) => {
        const response = data.toString('utf-8');
        const jsonResponse = JSON.parse(response);
        if (jsonResponse.ping) {
            // console.log("Ping received !!!");
            socket.send(JSON.stringify(requestMsg));
        } else {
            txControll(jsonResponse);
            // console.log(`Socket data received! (Price: ${jsonResponse.tick.usd}, Changed: ${jsonResponse.tick.change}%)`);
        }
        socket.pause();
    })
}

run().catch((err) => {
    console.log("Error Detected:", err);
    process.exit(1);
});