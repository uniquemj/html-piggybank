import {ethers } from "./ethers.6.7.esm.min.js"
import { contractAddress, contractABI } from "./abis/PiggyBank.js"

const connectBtn = document.getElementById("connectBtn")
const setTimerBtn = document.getElementById("setTimer")
const depositBtn = document.getElementById("depositBtn")
const withdrawBtn = document.getElementById("withdrawBtn")
const getTimerBtn = document.getElementById("getTimer")
const getBalanceBtn = document.getElementById("getBalance")

getTimerBtn.onclick = async() =>{
    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.BaseContract(contractAddress, contractABI, signer)
        console.log("Getting Timer...")
        const timer = (await contract.getTimer()).toString()
        document.getElementById("time").innerText = `${timer}`
    }
}

getBalanceBtn.onclick = async() =>{
    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.BaseContract(contractAddress, contractABI, signer)
        console.log("Getting Balance...")
        const balance = await contract.getBalance()
        document.getElementById("balance").innerText = `${ethers.formatEther(balance)}`
    }
}
connectBtn.onclick = async () => {
    if (typeof window.ethereum !== "undefined") {
        try{
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch(error){
            console.log(error)
        }
        connectBtn.innerText = "Connected"

    } else {
        connectBtn.innerHTML = "Not Connected"
    }
}

setTimerBtn.onclick = async () => {
    const year = document.getElementById("timer").value
    if (year) {
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.BaseContract(
                contractAddress,
                contractABI,
                signer,
            )
            console.log("Checking. . .")
            if(!await contract.getTimer()){
                console.log("Setting Timer")
                await contract.setTimer(year)
            } else {
                window.alert("Your Timer is already set!!")
            }
        }
    }
}

depositBtn.onclick = async () => {
    const ethAmount = document.getElementById("amount").value

    if (typeof window.ethereum !== "undefined") {
        console.log("Depositing . . .")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.BaseContract(
            contractAddress,
            contractABI,
            signer,
        )
        try{
            const transactionResponse = await contract.deposit({
                value: ethers.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        }catch(error){
            console.log(error)
        }
    }
}

withdrawBtn.onclick = async () => {
    if(typeof window.ethereum !== "undefined"){
        console.log("WithDrawing . . .")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.BaseContract(contractAddress, contractABI, signer)
        try{
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        }catch(error){
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash} . . .`)
    return new Promise((resolve, reject) =>{
        provider.once(transactionResponse.hash, async(transactionReceipt)=>{
            const confirmation = await transactionReceipt.confirmations()
            console.log(`Completed with ${confirmation} confirmations.`)
            resolve()
        })
    })
}